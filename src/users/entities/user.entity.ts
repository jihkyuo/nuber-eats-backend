import { Column, Entity } from 'typeorm';
import { CoreEntity } from '../../common/entities/common.entity';
import { InputType, ObjectType } from '@nestjs/graphql';

type UserRole = 'client' | 'owner' | 'delivery';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;
}