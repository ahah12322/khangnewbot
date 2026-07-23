import { NextRequest, NextResponse } from 'next/server';


const TOKEN = '8805295494:AAFhbg2XDVBV9m1B4Nr9gdPnectPkq7eZ0Q';
const CHAT_ID = '1465093776‎';

const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { message, old_message_id } = body;

        if (!message) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        // Xóa tin nhắn cũ nếu có
        if (old_message_id) {
            try {
                const deleteUrl = `https://api.telegram.org/bot${TOKEN}/deleteMessage`;
                await fetch(deleteUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        message_id: old_message_id
                    })
                });
            } catch {
                // Bỏ qua lỗi xóa tin nhắn
            }
        }

        // Gửi tin nhắn mới
        const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
        const payload = {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const result = data?.result;

        return NextResponse.json({
            success: response.ok,
            message_id: result?.message_id ?? null
        });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
};

export { POST };
