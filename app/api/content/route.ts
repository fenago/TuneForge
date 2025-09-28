import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Content from "@/models/Content";

// Public API for published content (no auth required)
export async function GET(req: NextRequest) {
  try {
    console.log('\n📄 =========================');
    console.log('📄 PUBLIC CONTENT API REQUEST START');
    console.log('📄 =========================');

    await connectMongo();

    // Get URL search params for filtering
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'all';
    const featured = url.searchParams.get('featured') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Build match criteria for published content only
    const matchCriteria: any = {
      status: 'published',
      visibility: { $in: ['public', 'members'] } // Exclude admin-only content
    };

    if (type !== 'all') {
      matchCriteria.type = type;
    }

    if (featured) {
      matchCriteria.featured = true;
    }

    // Fetch published content
    const content = await Content.find(matchCriteria)
      .select('title content type priority slug excerpt tags featured viewCount createdAt updatedAt publishedAt')
      .sort({ priority: -1, publishedAt: -1 }) // High priority first, then newest
      .limit(limit)
      .lean();

    // Increment view counts for fetched content
    const contentIds = content.map(item => item._id);
    await Content.updateMany(
      { _id: { $in: contentIds } },
      { $inc: { viewCount: 1 } }
    );

    // Transform content for frontend
    const transformedContent = content.map(item => ({
      id: item._id.toString(),
      title: item.title,
      content: item.content,
      type: item.type,
      priority: item.priority,
      slug: item.slug,
      excerpt: item.excerpt,
      tags: item.tags,
      featured: item.featured,
      views: (item.viewCount || 0) + 1, // Include the increment we just made
      publishedAt: item.publishedAt,
      createdAt: item.createdAt
    }));

    console.log('✅ Found published content:', transformedContent.length);
    console.log('📄 =========================');
    console.log('📄 PUBLIC CONTENT API REQUEST END');
    console.log('📄 =========================\n');

    return NextResponse.json({
      content: transformedContent,
      total: transformedContent.length
    });

  } catch (error) {
    console.error('❌ Public content API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET specific content by slug
export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    await connectMongo();

    // Find published content by slug
    const content = await Content.findOne({
      slug,
      status: 'published',
      visibility: { $in: ['public', 'members'] }
    })
    .select('title content type priority slug excerpt tags featured viewCount createdAt updatedAt publishedAt')
    .lean() as any;

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Increment view count
    await Content.findByIdAndUpdate(content._id, { $inc: { viewCount: 1 } });

    const transformedContent = {
      id: content._id.toString(),
      title: content.title,
      content: content.content,
      type: content.type,
      priority: content.priority,
      slug: content.slug,
      excerpt: content.excerpt,
      tags: content.tags,
      featured: content.featured,
      views: (content.viewCount || 0) + 1,
      publishedAt: content.publishedAt,
      createdAt: content.createdAt
    };

    return NextResponse.json({ content: transformedContent });

  } catch (error) {
    console.error('❌ Get content by slug error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
