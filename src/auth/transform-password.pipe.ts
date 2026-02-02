import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { hash } from 'bcrypt';

@Injectable()
//otomatis hash password dari req body sebelum masuk ke controller
export class TransformPasswordPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    value.password = await hash(value.password, 12); //menggunakan bcrypt dengan 12 salt
    return value;
  }
}
