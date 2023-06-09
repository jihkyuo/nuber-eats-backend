import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
  @Field(type => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(type => String)
  @Column()
  name: string;

  @Field(type => Boolean, { nullable: true })
  @Column()
  isVegan: boolean;

  @Field(type => String, { defaultValue: '안양' })
  @Column()
  address: string;

  @Field(type => String)
  @Column()
  ownerName: string;

  @Field(type => String)
  @Column()
  categoryName: string;
}