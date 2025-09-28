"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
}

const PrivacyPolicy = () => {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      console.log(' Fetching privacy policy...');
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'privacy-policy' })
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        console.log('Privacy policy loaded');
      } else if (response.status === 404) {
        // Fallback to default content if none exists in CMS
        setContent({
          id: 'default',
          title: 'Privacy Policy',
          content: getDefaultPrivacyPolicy(),
          publishedAt: new Date().toISOString()
        });
      } else {
        throw new Error('Failed to load privacy policy');
      }
    } catch (error) {
      console.error('Error loading privacy policy:', error);
      setError('Failed to load privacy policy');
      // Fallback to default content
      setContent({
        id: 'default',
        title: 'Privacy Policy',
        content: getDefaultPrivacyPolicy(),
        publishedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPrivacyPolicy = () => {
    return `Last Updated: ${new Date().toLocaleDateString()}

Thank you for using TuneForge ("we," "us," or "our"). This Privacy Policy explains how we collect, use, and protect your information when you use our AI music generation platform.

**1. Information We Collect**

• **Account Information**: Name, email address, and profile information
• **Usage Data**: Songs generated, prompts used, and platform interactions  
• **Payment Information**: Billing details processed securely through Stripe
• **Technical Data**: IP address, browser type, and device information

**2. How We Use Your Information**

• Provide and improve our AI music generation services
• Process payments and manage your account
• Send important updates and support communications
• Analyze usage to enhance platform performance

**3. Data Protection**

• Your payment information is processed securely by Stripe
• We use industry-standard encryption to protect your data
• We never sell your personal information to third parties
• Your generated music remains private unless you choose to share it

**4. AI and Music Generation**

• Your music prompts may be used to improve our AI models
• Generated songs are stored securely and remain your intellectual property
• You control the privacy settings of your created content

**5. Cookies and Analytics**

• We use essential cookies for platform functionality
• Analytics help us understand how users interact with TuneForge
• You can manage cookie preferences in your browser

**6. Your Rights**

• Access, update, or delete your account information
• Download your generated music at any time
• Request data deletion (subject to legal requirements)

**7. Children's Privacy**

TuneForge is not intended for users under 13 years of age. We do not knowingly collect information from children.

**8. Contact Information**

For privacy-related questions or requests:
Email: privacy@tuneforge.ai

This policy may be updated periodically. Significant changes will be communicated via email.`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to TuneForge
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {content?.title || 'Privacy Policy'}
          </h1>
          
          {content?.publishedAt && (
            <p className="text-gray-600">
              Last updated: {new Date(content.publishedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {error ? (
            <div className="text-red-600 text-center py-8">
              <p className="mb-4">{error}</p>
              <button 
                onClick={fetchPrivacyPolicy}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="prose prose-gray max-w-none">
              <div 
                className="whitespace-pre-line leading-relaxed"
                style={{ fontFamily: 'inherit' }}
              >
                {content?.content}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Questions about this privacy policy? Contact us at{' '}
            <a href="mailto:privacy@tuneforge.ai" className="text-blue-600 hover:text-blue-700">
              privacy@tuneforge.ai
            </a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
