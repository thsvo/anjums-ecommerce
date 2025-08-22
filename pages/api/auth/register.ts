import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { withErrorHandler, ValidationErrors, APIError, ErrorType } from '../../../lib/error-handler';

const prisma = new PrismaClient();

async function registerHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    throw new APIError('Method not allowed', 405, ErrorType.VALIDATION);
  }

  const { email, password, firstName, lastName } = req.body;

  // Validate required fields
  if (!email) {
    throw ValidationErrors.REQUIRED_FIELD('Email');
  }
  if (!password) {
    throw ValidationErrors.REQUIRED_FIELD('Password');
  }
  if (!firstName) {
    throw ValidationErrors.REQUIRED_FIELD('First name');
  }
  if (!lastName) {
    throw ValidationErrors.REQUIRED_FIELD('Last name');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw ValidationErrors.INVALID_EMAIL();
  }

  // Validate password strength
  if (password.length < 6) {
    throw ValidationErrors.INVALID_PASSWORD();
  }

  // Validate name fields
  if (firstName.trim().length < 2) {
    throw new APIError(
      'First name must be at least 2 characters long',
      400,
      ErrorType.VALIDATION,
      { field: 'firstName' }
    );
  }
  if (lastName.trim().length < 2) {
    throw new APIError(
      'Last name must be at least 2 characters long',
      400,
      ErrorType.VALIDATION,
      { field: 'lastName' }
    );
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new APIError(
        'An account with this email already exists',
        409,
        ErrorType.CONFLICT,
        { field: 'email' }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      }
    });

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      throw new APIError(
        'Server configuration error',
        500,
        ErrorType.INTERNAL,
        { message: 'JWT_SECRET not configured' }
      );
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure cookie in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Set-Cookie', [
        `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`
      ]);
    }

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default withErrorHandler(registerHandler);