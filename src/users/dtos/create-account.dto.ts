import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class CreateAccountInput extends PickType(User, ['email', 'role', 'password']) {
}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {
}