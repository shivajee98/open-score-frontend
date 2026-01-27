
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Validate basic fields
        if (!body.amount || !body.tenure || !body.payout_option_id) {
            return NextResponse.json(
                { message: 'Invalid loan configuration' },
                { status: 400 }
            );
        }

        // Return success mock
        return NextResponse.json({
            success: true,
            message: 'Loan application submitted successfully',
            loan_id: `L-${Math.floor(Math.random() * 10000)}`,
            status: 'PENDING_APPROVAL'
        });

    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
