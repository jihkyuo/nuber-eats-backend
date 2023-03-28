import { Column, Entity } from 'typeorm';
import { CoreEntity } from '../../common/entities/common.entity';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

// type UserRole = 'client' | 'owner' | 'delivery';

enum UserRole {
  Owner,
  Client,
  Delivery
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {

  @Column()
  @Field(type => String)
  email: string;

  @Column()
  @Field(type => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(type => UserRole)
  role: UserRole;
}