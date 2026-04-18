/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter | null = null;

  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const from = (this.configService.get<string>('email.from') ?? '').trim();
    const pass = (this.configService.get<string>('email.password') ?? '').trim();

    if (!from) {
      this.fromEmail = '';
      return;
    }

    if (!pass) {
      this.fromEmail = '';
      return;
    }

    this.fromEmail = from;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: from,
        pass,
      },
    });
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<unknown> {
    if (!this.transporter) {
      throw new Error('SMTP_EMAIL or SMTP_PASSWORD is missing');
    }

    const mailOptions = {
      from: this.fromEmail,
      to,
      subject,
      html,
      text: text ?? '',
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      return response;
    } catch (error) {
      console.error('Nodemailer error:', error);
      throw error;
    }
  }
}
