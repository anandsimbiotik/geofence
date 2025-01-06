// import { Injectable, Inject } from '@nestjs/common';
// import { Cache } from 'cache-manager';

// @Injectable()
// export class RedisService {
//   constructor(@Inject('CACHE_MANAGER') private readonly cacheManager: Cache) { }

//   async set(key: string, value: any, ttl: number = 60): Promise<void> {
//     if (ttl) {
//       await this.cacheManager.set(key, value, ttl);
//     } else {
//       await this.cacheManager.set(key, value);
//     }
//   }

//   async get<T>(key: string): Promise<T | null> {
//     return await this.cacheManager.get<T>(key);
//   }

//   async del(key: string): Promise<void> {
//     await this.cacheManager.del(key);
//   }
// }







import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Store } from 'cache-manager-ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('CACHE_MANAGER') private readonly cacheManager: Cache) { }

  async set(key: string, value: any, ttl: number = 60): Promise<void> {
    if (ttl) {
      await this.cacheManager.set(key, value, ttl);
    } else {
      await this.cacheManager.set(key, value);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }


}
