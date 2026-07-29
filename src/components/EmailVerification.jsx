import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const response = searchParams.get('response');
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({ success: false, message: '' });

  useEffect(() => {
    if (token && response) {
      verifyEmail();
    }
  }, [token, response]);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      
      // Get player details
      const { data: player, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('id', token)
        .single();

      if (fetchError) throw fetchError;

      if (response === 'yes') {
        // Update player: APPROVED
        const { error } = await supabase
          .from('players')
          .update({ 
            status: 'approved',
            email_verified: true,
            verification_response: 'yes',
            verified_at: new Date().toISOString()
          })
          .eq('id', token);

        if (error) throw error;

        setResult({
          success: true,
          message: `Thank you ${player.fullname}! Your registration has been verified. You are now officially part of Mini Junior ArmWrestling Tournament! 🎉`
        });

      } else {
        // Player said NO
        const { error } = await supabase
          .from('players')
          .update({ 
            status: 'pending',
            email_verified: false,
            verification_response: 'no',
            verified_at: new Date().toISOString()
          })
          .eq('id', token);

        if (error) throw error;

        setResult({
          success: true,
          message: 'We\'ve noted your response. Your registration will be reviewed by our team.'
        });
      }

    } catch (error) {
      console.error('Verification error:', error);
      setResult({
        success: false,
        message: 'Failed to verify email. Please contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#FFD700' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p>Verifying your email...</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '500px',
      margin: '4rem auto',
      padding: '3rem',
      background: 'rgba(26,26,46,0.95)',
      borderRadius: '15px',
      border: '2px solid #FFD700',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
        {result.success && response === 'yes' ? '✅' : 
         result.success && response === 'no' ? '📝' : '❌'}
      </div>
      
      <h2 style={{ color: '#FFD700', marginBottom: '1rem' }}>
        {result.success && response === 'yes' ? 'Email Verified!' :
         result.success && response === 'no' ? 'Response Recorded' : 'Verification Failed'}
      </h2>
      
      <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.8' }}>
        {result.message}
      </p>

      {result.success && response === 'yes' && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(46,204,113,0.1)',
          borderRadius: '10px',
          border: '1px solid #2ecc71'
        }}>
          <p style={{ color: '#2ecc71' }}>
            🎊 Welcome to the Hyderabadi Boyz family!
          </p>
        </div>
      )}

      <Link to="/" style={{
        display: 'inline-block',
        marginTop: '2rem',
        padding: '0.8rem 2rem',
        background: 'linear-gradient(135deg, #FFD700, #DAA520)',
        color: '#0a0a0a',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease'
      }}>
        🏠 Go to Home
      </Link>
    </div>
  );
};

export default EmailVerification;