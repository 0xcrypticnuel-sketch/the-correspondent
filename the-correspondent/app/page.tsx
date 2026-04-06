'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});
  const [filter, setFilter] = useState('All');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setArticles(data.articles);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const regions = ['All', '🌍 Africa', '🌏 Asia', '🌍 Europe', '🌎 Americas', '🌍 Middle East', '🌐 Global'];
  const filtered = filter === 'All' ? articles : articles.filter((a) => a.region === filter);

  return (
    <main className="min-h-screen bg-[#f9f6f0] text-gray-900">
      <header className="border-b-4 border-gray-900 bg-[#f9f6f0] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse inline-block"></span>
              LIVE {lastUpdated ? `· Updated ${lastUpdated}` : ''}
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-center font-serif">THE CORRESPONDENT</h1>
          <p className="text-center text-xs text-gray-500 mt-1 tracking-widest uppercase">AI Bureau · Global Dispatches · Independent Journalism</p>
        </div>
      </header>
      <div className="border-b border-gray-300 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
          {regions.map((r) => (
            <button key={r} onClick={() => setFilter(r)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
                filter === r ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-600'
              }`}>
              {r}
            </button>
          ))}
          <button onClick={fetchNews} className="text-xs px-3 py-1 rounded-full whitespace-nowrap border border-blue-400 text-blue-600 hover:bg-blue-50 ml-auto">
            ↻ Refresh
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">🗞️</div>
            <p className="text-gray-500 text-sm tracking-widest uppercase animate-pulse">Fetching dispatches from the wire...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-600 text-sm font-medium">Error: {error}</p>
            <button onClick={fetchNews} className="mt-4 text-xs underline text-gray-500">Try again</button>
          </div>
        )}
        {!loading && !error && articles.length > 0 && (
          <>
            {filtered[0] && (
              <article className="border-b-2 border-gray-900 pb-8 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 uppercase tracking-wider">Breaking</span>
                  <span className="text-xs text-gray-500">{filtered[0].region}</span>
                </div>
                <h2 className="text-4xl font-black font-serif leading-tight mb-3">{filtered[0].headline}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
                  <span>By <strong>The Correspondent AI Bureau</strong></span>
                  <span>·</span>
                  <span>{new Date(filtered[0].publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span>·</span>
                  <span>Source: {filtered[0].source}</span>
                </div>
                <p className="text-lg leading-relaxed text-gray-800 font-serif">
                  {expanded[filtered[0].id] ? filtered[0].article : filtered[0].article.slice(0, 400) + '...'}
                </p>
                <button onClick={() => toggleExpand(filtered[0].id)}
                  className="mt-4 text-sm font-semibold text-gray-900 border-b border-gray-900 hover:text-red-600 hover:border-red-600 transition-colors">
                  {expanded[filtered[0].id] ? 'Show less ↑' : 'Continue reading ↓'}
                </button>
              </article>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(1).map((article) => (
                <article key={article.id} className="border-t border-gray-300 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">{article.region}</span>
                  </div>
                  <h3 className="text-lg font-black font-serif leading-snug mb-2">{article.headline}</h3>
                  <div className="text-xs text-gray-500 mb-3">
                    <span>By <strong>The Correspondent AI Bureau</strong></span>
                    <span className="mx-1">·</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 font-serif">
                    {expanded[article.id] ? article.article : article.article.slice(0, 200) + '...'}
                  </p>
                  <button onClick={() => toggleExpand(article.id)}
                    className="mt-3 text-xs font-semibold text-gray-900 border-b border-gray-900 hover:text-red-600 hover:border-red-600 transition-colors">
                    {expanded[article.id] ? 'Show less ↑' : 'Continue reading ↓'}
                  </button>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Informed by: <span className="text-gray-600">{article.source}</span></p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
      <footer className="border-t-2 border-gray-900 mt-16 py-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black font-serif mb-2">THE CORRESPONDENT</h2>
          <p className="text-xs text-gray-400 tracking-widest uppercase">Powered by AI · No human in the editorial path · Global Coverage</p>
          <p className="text-xs text-gray-600 mt-4">© {new Date().getFullYear()} The Correspondent AI Bureau. All dispatches generated by artificial intelligence.</p>
        </div>
      </footer>
    </main>
  );
}