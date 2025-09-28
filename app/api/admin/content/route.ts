import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Content from "@/models/Content";

// GET - Fetch all content items with filtering
export async function GET(req: NextRequest) {
  try {
    console.log('\n📄 =========================');
    console.log('📄 CONTENT MANAGEMENT API REQUEST START');
    console.log('📄 =========================');

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('✅ Session found for:', session.user.email);

    // Connect to database
    await connectMongo();
    console.log('✅ Connected to MongoDB');

    // Check if user is admin
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      console.log('❌ User is not admin:', currentUser?.role);
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    console.log('✅ Admin access confirmed');

    // Get URL search params for filtering
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Build match criteria
    const matchCriteria: any = {};
    
    if (search) {
      matchCriteria.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (type !== 'all') {
      matchCriteria.type = type;
    }

    if (status !== 'all') {
      matchCriteria.status = status;
    }

    // Fetch content with pagination
    const content = await Content.find(matchCriteria)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1, priority: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalCount = await Content.countDocuments(matchCriteria);

    // Transform content for frontend
    const transformedContent = content.map(item => ({
      id: item._id.toString(),
      title: item.title,
      content: item.content,
      type: item.type,
      status: item.status,
      priority: item.priority,
      slug: item.slug,
      excerpt: item.excerpt,
      tags: item.tags,
      featured: item.featured,
      visibility: item.visibility,
      views: item.viewCount || 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      publishedAt: item.publishedAt,
      createdBy: item.createdBy?.name || 'Unknown',
      updatedBy: item.updatedBy?.name || 'Unknown'
    }));

    // Calculate statistics
    const stats = await Content.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draft: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          archived: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          totalViews: { $sum: '$viewCount' }
        }
      }
    ]);

    const statistics = stats[0] || {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      totalViews: 0
    };

    console.log('✅ Found content items:', transformedContent.length);
    console.log('✅ Total content in DB:', statistics.total);
    console.log('📄 =========================');
    console.log('📄 CONTENT MANAGEMENT API REQUEST END');
    console.log('📄 =========================\n');

    return NextResponse.json({
      content: transformedContent,
      stats: statistics,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('❌ Content API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new content item
export async function POST(req: NextRequest) {
  try {
    console.log('\n📄 =========================');
    console.log('📄 CREATE CONTENT API REQUEST START');
    console.log('📄 =========================');

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Check if user is admin
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, type, status, priority, excerpt, tags, visibility, featured } = body;

    // Validate required fields
    if (!title || !content || !type) {
      return NextResponse.json({ 
        error: "Missing required fields: title, content, and type are required" 
      }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingContent = await Content.findOne({ slug });
    if (existingContent) {
      return NextResponse.json({ 
        error: "A content item with this title already exists" 
      }, { status: 400 });
    }

    // Create new content
    const newContent = new Content({
      title,
      content,
      type,
      status: status || 'draft',
      priority: priority || 'medium',
      slug,
      excerpt,
      tags: tags || [],
      visibility: visibility || 'public',
      featured: featured || false,
      createdBy: currentUser._id,
      updatedBy: currentUser._id
    });

    await newContent.save();

    console.log('✅ Content created:', newContent._id);
    console.log('📄 =========================');
    console.log('📄 CREATE CONTENT API REQUEST END');
    console.log('📄 =========================\n');

    return NextResponse.json({
      message: "Content created successfully",
      content: {
        id: newContent._id.toString(),
        title: newContent.title,
        slug: newContent.slug,
        type: newContent.type,
        status: newContent.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Create content error:', error);
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}
