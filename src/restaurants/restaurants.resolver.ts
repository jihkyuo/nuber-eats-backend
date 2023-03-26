import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {
  }

  @Query(returns => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(returns => Boolean)
  async createRestaurant(@Args('input') createRestaurantDto: CreateRestaurantDto): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (err) {
      console.log('🚨 Create Restaurant \n', err);
      return false;
    }
  }
}