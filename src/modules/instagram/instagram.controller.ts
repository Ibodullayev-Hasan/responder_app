import {
  Controller, Get, Post, Query, Req, Res, Headers,
  HttpCode, ForbiddenException, RawBodyRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { InstagramService } from './instagram.service';

@Controller('instagram/webhook')
export class InstagramController {
  constructor(private readonly ig: InstagramService) {}

  // Meta webhook'ni tasdiqlash uchun (bir marta)
  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode === 'subscribe' && token === process.env.IG_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    throw new ForbiddenException();
  }

  // Kiruvchi xabarlar
  @Post()
  @HttpCode(200)
  handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    console.log('WEBHOOK BODY:', JSON.stringify(req.body));
    this.assertSignature(req.rawBody, signature);
    this.ig.processWebhook(req.body).catch(console.error);
    return 'EVENT_RECEIVED';
  }

  private assertSignature(raw: Buffer | undefined, signature?: string) {
    if (!raw || !signature) throw new ForbiddenException();
    const expected =
      'sha256=' +
      createHmac('sha256', process.env.IG_APP_SECRET!).update(raw).digest('hex');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException();
    }
  }
}