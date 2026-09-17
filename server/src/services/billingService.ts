import { Attendance } from '../models/Attendance';
import { Bill } from '../models/Bill';

export class BillingService {
  /**
   * Calculate monthly bill for a student based on attended meals
   */
  static async generateMonthlyBill(
    studentId: string,
    month: string,
    year: number,
    ratePerMeal: number = 55
  ): Promise<any> {
    const records = await Attendance.find({
      studentId,
      date: { $regex: `^${year}` },
    });

    let totalMeals = 0;
    records.forEach((rec) => {
      totalMeals += rec.totalMeals || 0;
    });

    const totalAmount = totalMeals * ratePerMeal;

    const bill = await Bill.create({
      studentId,
      rollNo: studentId,
      month,
      year,
      mealCount: totalMeals,
      totalMeals,
      ratePerMeal,
      extraCharges: 0,
      discount: 0,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      status: 'pending',
    });

    return bill;
  }
}
