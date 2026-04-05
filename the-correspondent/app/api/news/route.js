import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const newsRes = await fetch(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=6&apiKey=${process.env.NEWS_API_KEY}`
    );

    const newsData = await newsRes.json();

    if (newsData.status === 'error') {
      return NextResponse.json({ error: newsData.message }, { status: 400 });
    }

    if (!newsData.articles || newsData.articles.length === 0) {
      return NextResponse.json({ error: 'No articles found' }, { status: 404 });
    }

    const articles = newsData.articles.slice(0, 6).map((item) => {
      const region = detectRegion(item.title + ' ' + (item.description || ''));
      return {
        id: Math.random().toString(36).substr(2, 9),
        headline: item.title,
        article: item.description || 'No description available.',
        source: item.source?.name || 'Unknown',
        publishedAt: item.publishedAt,
        url: item.url,
        region,
      };
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Full error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function detectRegion(text) {
  const t = text.toLowerCase();
  if (t.match(/africa|nigeria|kenya|ghana|egypt|ethiopia|south africa/)) return '🌍 Africa';
  if (t.match(/china|japan|india|korea|asia|beijing|tokyo|delhi/)) return '🌏 Asia';
  if (t.match(/europe|uk|france|germany|italy|spain|brussels|london|paris/)) return '🌍 Europe';
  if (t.match(/us|usa|america|washington|new york|biden|trump|congress/)) return '🌎 Americas';
  if (t.match(/middle east|israel|iran|saudi|iraq|syria|gaza/)) return '🌍 Middle East';
  return '🌐 Global';
}