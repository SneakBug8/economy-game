import { Controller, Get, Req, Res } from '@nestjs/common';

@Controller()
export class LoginController {
  constructor() {}

  @Get("/login")
  getHello(@Req() req, @Res() res): string {
    req.session.userid = "11";
    return "Hello";
  }
}