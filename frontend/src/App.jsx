import React, { useState } from 'react';
import { Film, Loader2, Download, RefreshCw, Info } from 'lucide-react';

const MovieRecommendationApp = () => {
  const [mood, setMood] = useState('Feel-good');
  const [genres, setGenres] = useState(['Drama']);
  const [language, setLanguage] = useState('English');
  const [platform, setPlatform] = useState('Netflix');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const moods = ['Feel-good', 'Thriller', 'Mystery', 'Emotional', 'Light-hearted', 'Dark', 'Inspirational'];
  const allGenres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Romance', 'Horror', 'Documentary', 'Animation', 'Fantasy', 'Crime', 'Adventure'];
  const languages = ['English', 'Hindi', 'Spanish', 'French', 'Japanese', 'Korean', 'German', 'Italian', 'Chinese', 'Any'];
  const platforms = ['Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Hulu', 'Apple TV+', 'Paramount+', 'Any Platform'];

  const handleGenreToggle = (genre) => {
    setGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleGetRecommendations = async () => {
    if (genres.length === 0) {
      setError('Please select at least one genre!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood,
          genres,
          language,
          platform
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRecommendations(null);
    setError(null);
  };

  const handleDownload = () => {
    if (!recommendations) return;
    
    const element = document.createElement('a');
    const file = new Blob([recommendations.recommendations], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'movie_recommendations.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">AI Movie Recommendations</h1>
          </div>
          <p className="text-xl text-purple-200">Get personalized movie recommendations based on your preferences!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Preferences */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">📝 Your Preferences</h2>

              {/* Mood Selection */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">What's your mood?</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {moods.map(m => (
                    <option key={m} value={m} className="bg-gray-800">{m}</option>
                  ))}
                </select>
              </div>

              {/* Genre Selection */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Preferred Genre(s)</label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {allGenres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => handleGenreToggle(genre)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        genres.includes(genre)
                          ? 'bg-purple-600 text-white shadow-lg scale-105'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Preferred Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang} className="bg-gray-800">{lang}</option>
                  ))}
                </select>
              </div>

              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Streaming Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {platforms.map(plat => (
                    <option key={plat} value={plat} className="bg-gray-800">{plat}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGetRecommendations}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Finding Movies...
                    </>
                  ) : (
                    <>
                      <Film className="w-5 h-5" />
                      Get Recommendations
                    </>
                  )}
                </button>

                <button
                  onClick={handleClear}
                  className="w-full bg-white/20 text-white font-bold py-3 px-6 rounded-lg hover:bg-white/30 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Clear Results
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Recommendations */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 min-h-[600px]">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded-lg mb-6">
                  ⚠️ {error}
                </div>
              )}

              {recommendations ? (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6">🎥 Your Personalized Recommendations</h2>

                  {/* Preference Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-purple-300 text-sm">Mood</p>
                      <p className="text-white font-bold text-lg">{recommendations.preferences.mood}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-purple-300 text-sm">Genres</p>
                      <p className="text-white font-bold text-lg">
                        {recommendations.preferences.genres.slice(0, 2).join(', ')}
                        {recommendations.preferences.genres.length > 2 && '...'}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-purple-300 text-sm">Language</p>
                      <p className="text-white font-bold text-lg">{recommendations.preferences.language}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-purple-300 text-sm">Platform</p>
                      <p className="text-white font-bold text-lg">{recommendations.preferences.platform}</p>
                    </div>
                  </div>

                  <hr className="border-white/20 mb-6" />

                  {/* Recommendations Text */}
                  <div className="bg-white/5 rounded-lg p-6 mb-6">
                    <pre className="text-white whitespace-pre-wrap font-sans leading-relaxed">
                      {recommendations.recommendations}
                    </pre>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Recommendations
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Film className="w-24 h-24 text-purple-300 mb-6 opacity-50" />
                  <h3 className="text-2xl font-bold text-white mb-4">Ready to discover your next favorite movie?</h3>
                  <p className="text-purple-200 mb-6 max-w-md">
                    Select your preferences from the sidebar and click "Get Recommendations" to start!
                  </p>
                  
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-purple-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Info className="w-5 h-5" />
                    How it works
                  </button>

                  {showInfo && (
                    <div className="mt-6 bg-white/10 rounded-lg p-6 max-w-2xl text-left">
                      <h4 className="text-xl font-bold text-white mb-4">ℹ️ How it works</h4>
                      <div className="text-purple-200 space-y-2">
                        <p>This AI-powered agent helps you find the perfect movie by:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li><strong>Understanding your mood</strong> - Whether you want something thrilling or feel-good</li>
                          <li><strong>Matching your genre preferences</strong> - Action, Drama, Comedy, or any combination</li>
                          <li><strong>Respecting language preferences</strong> - Movies in your preferred language</li>
                          <li><strong>Platform-specific suggestions</strong> - Only recommends what's available on your platform</li>
                        </ul>
                        <p className="mt-4">The AI analyzes all these factors to give you personalized, relevant recommendations!</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-300">Powered by LangGraph + Groq + FastAPI + React</p>
        </div>
      </div>
    </div>
  );
};

export default MovieRecommendationApp;