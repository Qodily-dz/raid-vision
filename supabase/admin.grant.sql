-- Run this after creating the Auth user in Supabase Dashboard.
-- Auth > Users > Add user
-- Email: admin@admin.com
-- Set the password there and enable Auto Confirm User.

insert into raid_db.admin_users (user_id, role, active)
select id, 'owner', true
from auth.users
where lower(email) = lower('admin@admin.com')
on conflict (user_id) do update
set role = 'owner',
    active = true;

select au.user_id, u.email, au.role, au.active
from raid_db.admin_users au
join auth.users u on u.id = au.user_id
where lower(u.email) = lower('admin@admin.com');
