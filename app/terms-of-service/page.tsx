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

const TermsOfService = () => {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTermsOfService();
  }, []);

  const fetchTermsOfService = async () => {
    try {
      console.log('📄 Fetching terms of service...');
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'terms-of-service' })
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        console.log('✅ Terms of service loaded');
      } else if (response.status === 404) {
        // Fallback to default content if none exists in CMS
        setContent({
          id: 'default',
          title: 'Terms of Service',
          content: getDefaultTermsOfService(),
          publishedAt: new Date().toISOString()
        });
      } else {
        throw new Error('Failed to load terms of service');
      }
    } catch (error) {
      console.error('❌ Error loading terms of service:', error);
      setError('Failed to load terms of service');
      // Fallback to default content
      setContent({
        id: 'default',
        title: 'Terms of Service',
        content: getDefaultTermsOfService(),
        publishedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTermsOfService = () => {
    return `Last Updated: ${new Date().toLocaleDateString()}

**Welcome to TuneForge**

These Terms of Service ("Terms") govern your use of TuneForge ("we," "us," or "our"), an AI-powered music generation platform. By accessing or using our service, you agree to be bound by these Terms.

**1. Acceptance of Terms**

By creating an account or using TuneForge, you acknowledge that you have read, understood, and agree to these Terms and our Privacy Policy.

**2. Description of Service**

TuneForge provides AI-powered music generation tools that allow users to create original music compositions through artificial intelligence technology.

**3. User Accounts**

• You must provide accurate, current information when creating your account
• You are responsible for maintaining the security of your account credentials
• You must be at least 13 years old to use our service
• One account per person; shared accounts are not permitted

**4. Acceptable Use**

You agree NOT to use TuneForge to:
• Generate music that infringes on others' intellectual property rights
• Create content that is illegal, harmful, threatening, or discriminatory
• Attempt to reverse engineer or hack our AI models
• Use our service for any commercial purpose without proper licensing
• Share your account credentials with others

**5. Intellectual Property Rights**

• **Your Content**: You retain ownership of music you create using TuneForge
• **Our Technology**: TuneForge owns all rights to our AI models, algorithms, and platform technology
• **Generated Music**: While you own your generated songs, they may not be eligible for copyright protection as they are AI-generated
• **Platform Content**: All text, graphics, and other materials on our platform are our property

**6. User-Generated Content**

• You grant us a limited license to store and process your music for service provision
• You are solely responsible for the content you create and share
• We may remove content that violates these Terms or applicable laws
• Public songs may be used for platform promotion with your permission

**7. Payment Terms**

• Subscription fees are billed in advance and are non-refundable
• We reserve the right to change pricing with 30 days' notice
• Free accounts have usage limitations as specified in your account dashboard
• Payment processing is handled securely through Stripe

**8. AI Model Usage**

• Our AI models are continuously improving and may change over time
• Generated music quality may vary and is not guaranteed
• You understand that AI-generated content has inherent limitations
• We do not guarantee the uniqueness of generated compositions

**9. Data and Privacy**

• Your privacy is important to us - see our Privacy Policy for details
• We collect usage data to improve our AI models and service
• Your personal information is protected according to our privacy practices
• You can request data deletion subject to legal and technical constraints

**10. Limitation of Liability**

TuneForge is provided "as-is" without warranties. We are not liable for:
• Any direct, indirect, or consequential damages
• Loss of data, profits, or business opportunities  
• Copyright disputes arising from your generated content
• Service interruptions or technical failures

**11. Termination**

• You may close your account at any time through account settings
• We may suspend or terminate accounts that violate these Terms
• Upon termination, you retain access to your downloaded content
• Subscription benefits end immediately upon account closure

**12. Changes to Terms**

• We may modify these Terms periodically
• Material changes will be communicated via email
• Continued use after changes constitutes acceptance
• You should review Terms regularly for updates

**13. Dispute Resolution**

• Any disputes will be resolved through binding arbitration
• You waive the right to participate in class action lawsuits
• Governing law is the jurisdiction where TuneForge is incorporated

**14. Contact Information**

Questions about these Terms?
Email: legal@tuneforge.ai
Address: [Your Business Address]

**15. Severability**

If any provision of these Terms is deemed invalid, the remaining provisions remain in full force and effect.

By using TuneForge, you acknowledge that you understand and agree to these Terms of Service.`;
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
            {content?.title || 'Terms of Service'}
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
                onClick={fetchTermsOfService}
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
            Questions about these terms? Contact us at{' '}
            <a href="mailto:legal@tuneforge.ai" className="text-blue-600 hover:text-blue-700">
              legal@tuneforge.ai
            </a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default TermsOfService;
