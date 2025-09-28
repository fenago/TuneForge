import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Content from "@/models/Content";

// GET - Get specific content item
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('\n📄 =========================');
    console.log('📄 GET CONTENT ITEM API REQUEST START');
    console.log('📄 Content ID:', params.id);

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

    // Find content item
    const content = await Content.findById(params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean() as any;

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const contentItem = {
      id: content._id.toString(),
      title: content.title,
      content: content.content,
      type: content.type,
      status: content.status,
      priority: content.priority,
      slug: content.slug,
      excerpt: content.excerpt,
      tags: content.tags,
      metadata: content.metadata,
      visibility: content.visibility,
      featured: content.featured,
      views: content.viewCount || 0,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      publishedAt: content.publishedAt,
      archivedAt: content.archivedAt,
      createdBy: {
        id: content.createdBy._id.toString(),
        name: content.createdBy.name,
        email: content.createdBy.email
      },
      updatedBy: {
        id: content.updatedBy._id.toString(),
        name: content.updatedBy.name,
        email: content.updatedBy.email
      }
    };

    console.log('✅ Content item retrieved');
    console.log('📄 =========================');
    console.log('📄 GET CONTENT ITEM API REQUEST END');
    console.log('📄 =========================\n');

    return NextResponse.json({ content: contentItem });

  } catch (error) {
    console.error('❌ Get content error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update content item
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('\n📄 =========================');
    console.log('📄 UPDATE CONTENT API REQUEST START');
    console.log('📄 Content ID:', params.id);

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
    const { action, title, content, type, status, priority, excerpt, tags, visibility, featured } = body;

    // Find content item
    const contentItem = await Content.findById(params.id);
    if (!contentItem) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Handle different actions
    if (action) {
      switch (action) {
        case 'publish':
          contentItem.status = 'published';
          contentItem.publishedAt = new Date();
          break;
        case 'unpublish':
          contentItem.status = 'draft';
          contentItem.publishedAt = undefined;
          break;
        case 'archive':
          contentItem.status = 'archived';
          contentItem.archivedAt = new Date();
          break;
        case 'restore':
          contentItem.status = 'draft';
          contentItem.archivedAt = undefined;
          break;
        case 'feature':
          contentItem.featured = true;
          break;
        case 'unfeature':
          contentItem.featured = false;
          break;
      }
    } else {
      // Regular update
      if (title !== undefined) {
        contentItem.title = title;
        // Regenerate slug if title changed
        contentItem.slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      if (content !== undefined) contentItem.content = content;
      if (type !== undefined) contentItem.type = type;
      if (status !== undefined) contentItem.status = status;
      if (priority !== undefined) contentItem.priority = priority;
      if (excerpt !== undefined) contentItem.excerpt = excerpt;
      if (tags !== undefined) contentItem.tags = tags;
      if (visibility !== undefined) contentItem.visibility = visibility;
      if (featured !== undefined) contentItem.featured = featured;
    }

    // Update metadata
    contentItem.updatedBy = currentUser._id;
    
    await contentItem.save();

    console.log('✅ Content updated:', action || 'fields updated');
    console.log('📄 =========================');
    console.log('📄 UPDATE CONTENT API REQUEST END');
    console.log('📄 =========================\n');

    return NextResponse.json({
      message: "Content updated successfully",
      content: {
        id: contentItem._id.toString(),
        title: contentItem.title,
        status: contentItem.status,
        featured: contentItem.featured
      }
    });

  } catch (error) {
    console.error('❌ Update content error:', error);
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}

// DELETE - Delete content item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('\n📄 =========================');
    console.log('📄 DELETE CONTENT API REQUEST START');
    console.log('📄 Content ID:', params.id);

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

    // Find and delete content item
    const content = await Content.findById(params.id);
    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const contentTitle = content.title;
    await Content.findByIdAndDelete(params.id);

    console.log('✅ Content deleted:', contentTitle);
    console.log('📄 =========================');
    console.log('📄 DELETE CONTENT API REQUEST END');
    console.log('📄 =========================\n');

    return NextResponse.json({
      message: "Content deleted successfully",
      title: contentTitle
    });

  } catch (error) {
    console.error('❌ Delete content error:', error);
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}
