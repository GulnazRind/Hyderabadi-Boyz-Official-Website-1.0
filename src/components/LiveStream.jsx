import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const LiveStream = () => {
  const [liveData, setLiveData] = useState({
    stream_url: '',
    is_active: false,
    title: 'No Live Stream'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveSettings();
    const interval = setInterval(fetchLiveSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('live_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setLiveData(data || { stream_url: '', is_active: false, title: 'No Live Stream' });
    } catch (error) {
      console.error('Error fetching live settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Instagram Embed URL
  const getInstagramEmbedUrl = (url) => {
    if (!url) return null;
    // If it's a YouTube URL, use YouTube embed
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return videoId ? `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&rel=0` : null;
    }
    // If it's an Instagram URL, use Instagram embed
    if (url.includes('instagram.com')) {
      // Instagram live URLs
      if (url.includes('/live/')) {
        return url;
      }
      // Instagram post embed
      return url;
    }
    return url;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#FFD700' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading stream...</p>
      </div>
    );
  }

  const embedUrl = getInstagramEmbedUrl(liveData.stream_url);
  const isYouTube = liveData.stream_url?.includes('youtube.com') || liveData.stream_url?.includes('youtu.be');
  const isInstagram = liveData.stream_url?.includes('instagram.com');

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
        padding: '2rem',
        borderRadius: '15px',
        border: `2px solid ${liveData.is_active ? '#e74c3c' : '#555'}`,
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          {liveData.is_active ? (
            <>
              <div style={{
                width: '12px',
                height: '12px',
                background: '#e74c3c',
                borderRadius: '50%',
                animation: 'pulse 1s infinite'
              }}></div>
              <h2 style={{
                color: '#e74c3c',
                fontSize: '2rem',
                margin: 0
              }}>
                🔴 LIVE NOW
              </h2>
            </>
          ) : (
            <h2 style={{
              color: '#888',
              fontSize: '2rem',
              margin: 0
            }}>
              📡 Offline
            </h2>
          )}
        </div>
        <p style={{
          color: liveData.is_active ? '#fff' : '#666',
          marginTop: '0.5rem',
          fontSize: '1.1rem'
        }}>
          {liveData.title || (liveData.is_active ? 'Live Stream' : 'No live stream available')}
        </p>
      </div>

      {/* Video Player */}
      {liveData.is_active && embedUrl ? (
        <div style={{
          background: '#0a0a0a',
          borderRadius: '15px',
          overflow: 'hidden',
          border: '1px solid rgba(255,215,0,0.2)',
          position: 'relative',
          paddingBottom: isYouTube ? '56.25%' : '100%',
          height: 0
        }}>
          {isYouTube ? (
            <iframe
              src={embedUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Live Stream"
            />
          ) : isInstagram ? (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              background: '#0a0a0a'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
              <p style={{ color: '#FFD700', fontSize: '1.2rem' }}>
                Instagram Live Stream
              </p>
              <a 
                href={liveData.stream_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.8rem 2rem',
                  background: 'linear-gradient(135deg, #FFD700, #DAA520)',
                  color: '#0a0a0a',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  marginTop: '1rem'
                }}
              >
                Watch on Instagram →
              </a>
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0a0a0a'
            }}>
              <p style={{ color: '#888' }}>Invalid stream URL</p>
            </div>
          )}
        </div>
      ) : liveData.is_active ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          background: 'rgba(26,26,46,0.5)',
          borderRadius: '15px',
          border: '1px dashed rgba(255,215,0,0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
          <p style={{ color: '#888', fontSize: '1.1rem' }}>
            Invalid stream URL. Please contact admin.
          </p>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          background: 'rgba(26,26,46,0.5)',
          borderRadius: '15px',
          border: '1px dashed rgba(255,215,0,0.3)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📡</div>
          <p style={{ color: '#888', fontSize: '1.2rem' }}>
            No live stream available at the moment.
          </p>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>
            Check back later for live matches!
          </p>
        </div>
      )}

      {/* Share Button */}
      {liveData.is_active && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(26,26,46,0.5)',
          borderRadius: '10px',
          border: '1px solid rgba(255,215,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{ color: '#888' }}>🔴 Status: </span>
            <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>LIVE</span>
          </div>
          <div>
            <span style={{ color: '#888' }}>📱 Share: </span>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Hyderabadi Boyz Live Stream',
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              style={{
                padding: '0.3rem 1rem',
                background: 'rgba(255,215,0,0.1)',
                border: '1px solid #FFD700',
                borderRadius: '5px',
                color: '#FFD700',
                cursor: 'pointer'
              }}
            >
              📤 Share
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default LiveStream;