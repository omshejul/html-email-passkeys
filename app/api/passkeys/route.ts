import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authenticators = await prisma.authenticator.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        credentialID: true,
        credentialDeviceType: true,
        credentialBackedUp: true,
        transports: true,
        label: true,
        lastUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ passkeys: authenticators });
  } catch (error) {
    console.error("Error fetching passkeys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const passkeyId = searchParams.get("id");

    if (!passkeyId) {
      return NextResponse.json(
        { error: "Passkey ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { label } = body;

    if (typeof label !== "string") {
      return NextResponse.json(
        { error: "Label must be a string" },
        { status: 400 }
      );
    }

    // Verify the passkey belongs to the user before updating
    const authenticator = await prisma.authenticator.findFirst({
      where: {
        id: passkeyId,
        userId: session.user.id,
      },
    });

    if (!authenticator) {
      return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
    }

    const updatedAuthenticator = await prisma.authenticator.update({
      where: {
        id: passkeyId,
      },
      data: {
        label,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, passkey: updatedAuthenticator });
  } catch (error) {
    console.error("Error updating passkey:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const passkeyId = searchParams.get("id");

    if (!passkeyId) {
      return NextResponse.json(
        { error: "Passkey ID is required" },
        { status: 400 }
      );
    }

    // Verify the passkey belongs to the user before deleting
    const authenticator = await prisma.authenticator.findFirst({
      where: {
        id: passkeyId,
        userId: session.user.id,
      },
    });

    if (!authenticator) {
      return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
    }

    // Check if this is the user's last passkey
    const passkeysCount = await prisma.authenticator.count({
      where: {
        userId: session.user.id,
      },
    });

    if (passkeysCount <= 1) {
      return NextResponse.json(
        {
          error: "Cannot delete your last passkey. Add another passkey first.",
        },
        { status: 400 }
      );
    }

    await prisma.authenticator.delete({
      where: {
        id: passkeyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting passkey:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
