import { Router } from 'express';
import { createSupabaseClient } from '../../lib/supabase';

const adminRouter = Router();

// POST /api/admin/user-metadata/fix
adminRouter.post('/fix', async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'userId is required' 
        });
    }

    try {
        console.log(`[Admin] Attempting to fix metadata for user: ${userId}`);
        
        const supabase = createSupabaseClient('public');
        
        // Получаем пользователя из Supabase Auth
        const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId);
        
        if (getUserError) {
            console.error('[Admin] Error getting user:', getUserError);
            throw getUserError;
        }
        
        if (!user) {
            console.error('[Admin] User not found:', userId);
            throw new Error('User not found');
        }

        console.log('[Admin] User found:', {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
            app_metadata: user.app_metadata
        });

        const updates: { user_metadata?: object, app_metadata?: object } = {};
        
        // Проверяем user_metadata
        if (user.user_metadata === null || typeof user.user_metadata !== 'object') {
            updates.user_metadata = {
                username: user.email?.split('@')[0] || 'user',
                first_name: '',
                last_name: ''
            };
            console.log('[Admin] Will fix user_metadata');
        }
        
        // Проверяем app_metadata
        if (user.app_metadata === null || typeof user.app_metadata !== 'object') {
            updates.app_metadata = {
                roles: ['user'],
                department: 'civil'
            };
            console.log('[Admin] Will fix app_metadata');
        }

        if (Object.keys(updates).length > 0) {
            console.log('[Admin] Updating user metadata:', updates);
            
            const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
                userId, 
                updates
            );
            
            if (updateError) {
                console.error('[Admin] Error updating user:', updateError);
                throw updateError;
            }
            
            console.log('[Admin] User metadata updated successfully');
            
            return res.status(200).json({ 
                success: true, 
                message: 'Metadata fixed successfully',
                user: {
                    id: updateData.user.id,
                    email: updateData.user.email,
                    user_metadata: updateData.user.user_metadata,
                    app_metadata: updateData.user.app_metadata
                }
            });
        }
        
        console.log('[Admin] No metadata fix needed');
        return res.status(200).json({ 
            success: true, 
            message: 'No fix needed - metadata is already correct',
            user: {
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata,
                app_metadata: user.app_metadata
            }
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Admin] Error fixing user metadata:', error);
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage 
        });
    }
});

// GET /api/admin/user-metadata/check/:userId
adminRouter.get('/check/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        console.log(`[Admin] Checking metadata for user: ${userId}`);
        
        const supabase = createSupabaseClient('public');
        const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId);
        
        if (getUserError) {
            throw getUserError;
        }
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        const needsFix = {
            user_metadata: user.user_metadata === null || typeof user.user_metadata !== 'object',
            app_metadata: user.app_metadata === null || typeof user.app_metadata !== 'object'
        };

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata,
                app_metadata: user.app_metadata
            },
            needsFix,
            canFix: needsFix.user_metadata || needsFix.app_metadata
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Admin] Error checking user metadata:', error);
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage 
        });
    }
});

// POST /api/admin/user-metadata/fix-by-email
adminRouter.post('/fix-by-email', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ 
            success: false, 
            error: 'email is required' 
        });
    }

    try {
        console.log(`[Admin] Attempting to fix metadata for user by email: ${email}`);
        
        const supabase = createSupabaseClient('public');
        
        // Получаем всех пользователей и ищем по email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
            throw listError;
        }
        
        const user = users?.find((u: any) => u.email === email);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found with this email' 
            });
        }

        // Используем существующую логику исправления
        const updates: { user_metadata?: object, app_metadata?: object } = {};
        
        if (user.user_metadata === null || typeof user.user_metadata !== 'object') {
            updates.user_metadata = {
                username: user.email?.split('@')[0] || 'user',
                first_name: '',
                last_name: ''
            };
        }
        
        if (user.app_metadata === null || typeof user.app_metadata !== 'object') {
            updates.app_metadata = {
                roles: ['user'],
                department: 'civil'
            };
        }

        if (Object.keys(updates).length > 0) {
            const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
                user.id, 
                updates
            );
            
            if (updateError) {
                throw updateError;
            }
            
            return res.status(200).json({ 
                success: true, 
                message: 'Metadata fixed successfully',
                user: {
                    id: updateData.user.id,
                    email: updateData.user.email,
                    user_metadata: updateData.user.user_metadata,
                    app_metadata: updateData.user.app_metadata
                }
            });
        }
        
        return res.status(200).json({ 
            success: true, 
            message: 'No fix needed - metadata is already correct',
            user: {
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata,
                app_metadata: user.app_metadata
            }
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Admin] Error fixing user metadata by email:', error);
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage 
        });
    }
});

export default adminRouter; 