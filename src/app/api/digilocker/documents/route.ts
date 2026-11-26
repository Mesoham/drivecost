import { NextRequest, NextResponse } from 'next/server';

interface DigiLockerItem {
  name?: string;
  type?: string;
  size?: string;
  date?: string;
  parent?: string;
  mime?: string[];
  uri?: string;
  doctype?: string;
  description?: string;
  issuer?: string;
}

function classifyDocType(item: DigiLockerItem): string {
  const text = `${item.doctype || ''} ${item.name || ''} ${item.description || ''}`.toLowerCase();
  if (text.includes('rc') || text.includes('registration') || text.includes('rver')) {
    return 'Registration Certificate (RC)';
  }
  if (text.includes('insur') || text.includes('policy')) {
    return 'Insurance Policy';
  }
  if (text.includes('puc') || text.includes('pollution') || text.includes('emission')) {
    return 'PUC Certificate';
  }
  if (text.includes('driv') || text.includes('dl') || text.includes('license')) {
    return 'Driving License';
  }
  return 'Other';
}

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('dl_access_token')?.value;
  if (!accessToken) {
    return NextResponse.json(
      { error: 'DigiLocker session not connected. Please connect DigiLocker first.' },
      { status: 401 }
    );
  }

  const issuedUrl =
    process.env.DIGILOCKER_ISSUED_URL ||
    'https://api.digitallocker.gov.in/public/oauth2/2/files/issued';
  const fileBaseUrl =
    process.env.DIGILOCKER_FILE_URL ||
    'https://api.digitallocker.gov.in/public/oauth2/1/file';

  try {
    const listRes = await fetch(issuedUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!listRes.ok) {
      const errBody = await listRes.text();
      return NextResponse.json(
        { error: `DigiLocker API error (${listRes.status}): ${errBody}` },
        { status: listRes.status }
      );
    }

    const listData = await listRes.json();
    const items: DigiLockerItem[] = Array.isArray(listData?.items) ? listData.items : [];

    // Fetch up to 15 issued documents and return base64 PDFs
    const docs = await Promise.all(
      items.slice(0, 15).map(async (item) => {
        if (!item.uri) return null;
        try {
          const fileRes = await fetch(
            `${fileBaseUrl}/${encodeURIComponent(item.uri)}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!fileRes.ok) return null;
          const arrayBuf = await fileRes.arrayBuffer();
          const mimeType = fileRes.headers.get('content-type') || 'application/pdf';
          const base64 = Buffer.from(arrayBuf).toString('base64');
          const isPdf = mimeType.includes('pdf');

          return {
            title: item.description || item.name || 'DigiLocker Document',
            type: classifyDocType(item),
            fileName: `${(item.name || item.doctype || 'doc').replace(/\s+/g, '_')}.${isPdf ? 'pdf' : 'png'}`,
            fileType: isPdf ? 'pdf' : 'image',
            fileData: `data:${mimeType};base64,${base64}`,
            fileSize: arrayBuf.byteLength,
            documentNumber: item.uri,
            isDigiLockerVerified: true,
            notes: `Fetched directly from DigiLocker (${item.issuer || 'MoRTH / Official Issuer'})`
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      documents: docs.filter(Boolean),
      totalFound: items.length
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch DigiLocker documents' },
      { status: 500 }
    );
  }
}
