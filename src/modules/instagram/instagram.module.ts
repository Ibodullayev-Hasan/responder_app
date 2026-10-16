import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // <-- 1. HttpModule ni chaqiramiz
import { InstagramService } from './instagram.service';
import { InstagramController } from './instagram.controller';

@Module({
  imports: [
    HttpModule, // <-- 2. Shu yerga qo'shamiz
  ],
  controllers: [InstagramController],
  providers: [InstagramService],
  exports: [InstagramService],
})
export class InstagramModule { }