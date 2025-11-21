import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

type SystemSettingRecord = {
  setting_key: string;
  setting_value: string;
  setting_type: string;
  category: string;
};

// GET - Fetch all settings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settingsResult = await sql`
      SELECT setting_key, setting_value, setting_type, category
      FROM system_settings
      ORDER BY category, setting_key
    `.catch(() => {
      // If table doesn't exist, return defaults
      return [] as SystemSettingRecord[];
    });

    const settings = settingsResult as SystemSettingRecord[];

    // Convert to object format
    const settingsObj: Record<string, any> = {};
    for (const setting of settings) {
      let value: any = setting.setting_value;
      
      // Convert to appropriate type
      if (setting.setting_type === 'boolean') {
        value = value === 'true';
      } else if (setting.setting_type === 'number') {
        value = parseInt(value, 10);
      }
      
      settingsObj[setting.setting_key] = value;
    }

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings format' },
        { status: 400 }
      );
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'boolean' ? value.toString() : String(value);
      
      await sql`
        INSERT INTO system_settings (setting_key, setting_value, updated_by, updated_at)
        VALUES (${key}, ${stringValue}, ${session.user.id}, NOW())
        ON CONFLICT (setting_key)
        DO UPDATE SET 
          setting_value = ${stringValue},
          updated_by = ${session.user.id},
          updated_at = NOW()
      `.catch(() => {
        console.error(`Failed to update setting: ${key}`);
      });
    }

    // Log audit entry
    await sql`
      INSERT INTO audit_logs (admin_user_id, action_type, target_type, details, status)
      VALUES (${session.user.id}, 'settings_update', 'system', ${`Updated ${Object.keys(settings).length} settings`}, 'success')
    `.catch(() => {});

    return NextResponse.json({
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
