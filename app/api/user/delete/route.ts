import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

// DELETE: Delete user account and all associated data
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { confirmationText } = await req.json();

    // Require confirmation
    if (confirmationText !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Confirmation text does not match" },
        { status: 400 }
      );
    }

    // Delete user (cascade will delete all related data)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
