import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interface';
import * as FormData from 'form-data';
import got from 'got';


@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
  }

  private async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ) {
    const form = new FormData();
    form.append('from', `Jio from Nuber Eats <mailgun@${this.options.domain}>`);
    form.append('to', `jihkyuoo@naver.com`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(emailVar => form.append(`v:${emailVar.key}`, emailVar.value));
    try {
      await got(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`,
          },
          method: 'POST',
          body: form,
        },
      );
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail(
      'Verify Your Email',
      'verify-email',
      [
        { key: 'code', value: code },
        { key: 'username', value: email },
      ],
    );
  }
}
