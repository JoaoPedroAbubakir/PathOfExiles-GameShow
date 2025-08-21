import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { compare, hash } from 'bcrypt';
import { User } from '@/app/types/auth';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

async function initUsersFile() {
  try {
    await fs.access(USERS_FILE);
    // Check if the file is empty or malformed
    const content = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(content);
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('Invalid users file');
    }
  } catch {
    console.log('Creating default admin user...');
    // Create default admin user
    const hashedPassword = await hash('poequiz', 10);
    const defaultUsers = [{
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    }];
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    console.log('Default admin user created');
  }
}

export async function POST(request: NextRequest) {
  await initUsersFile();
  
  const { action, username, password, newPassword, newUsername, newPassword: userPassword } = await request.json();
  const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf-8')) as User[];

  switch (action) {
    case 'login': {
      const user = users.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const validPassword = await compare(password, user.password);
      if (!validPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }

      return NextResponse.json({ 
        username: user.username, 
        role: user.role 
      });
    }

    case 'changePassword': {
      const userIndex = users.findIndex((u: User) => u.username === username);
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const validPassword = await compare(password, users[userIndex].password);
      if (!validPassword) {
        return NextResponse.json({ error: 'Invalid current password' }, { status: 401 });
      }

      users[userIndex].password = await hash(newPassword, 10);
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
      return NextResponse.json({ success: true });
    }

    case 'addUser': {
      // Check if requester is admin
      const adminUser = users.find((u: User) => u.username === username);
      if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const validPassword = await compare(password, adminUser.password);
      if (!validPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }

      if (users.some((u: User) => u.username.toLowerCase() === newUsername.toLowerCase())) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }

      const hashedPassword = await hash(userPassword, 10);
      users.push({
        username: newUsername.trim(), // Store trimmed username
        password: hashedPassword,
        role: 'user'
      });

      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
