import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { withErrorHandler, ValidationErrors, APIError, ErrorType } from '../../../lib/error-handler';

const prisma = new PrismaClient();

async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    throw new APIError('Method not allowed', 405, ErrorType.VALIDATION);
  }

  const { email, password } = req.body;

  // Validate required fields
  if (!email) {
    throw ValidationErrors.REQUIRED_FIELD('Email');
  }
  if (!password) {
    throw ValidationErrors.REQUIRED_FIELD('Password');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw ValidationErrors.INVALID_EMAIL();
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw ValidationErrors.INVALID_CREDENTIALS();
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ValidationErrors.INVALID_CREDENTIALS();
    }

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

    res.status(200).json({
      message: 'Login successful',
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

export default withErrorHandler(loginHandler);