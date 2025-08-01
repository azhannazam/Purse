import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import BudgetModel from "@/model/Budget";
import ExpenseModel from "@/model/Expense";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

export async function PUT(
  request: Request,
  { params }: { params: { expenseId: string } }
) {
  await dbConnect();

  try {
    const expenseId = params.expenseId;

    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(_user._id);
    // Check if user exists and is verified
    const user = await UserModel.findById(userId);
    if (!user?.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    const { description, amount } = await request.json();


    // Find the expense
    const expense = await ExpenseModel.findById(expenseId);
    if (!expense) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Expense not found",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Expense deleted successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting expense:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error deleting expense",
      }),
      { status: 500 }
    );
  }
}