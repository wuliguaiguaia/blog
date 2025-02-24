## 背景

nest 是一个 node 框架，底层使用了 express，因此兼容 express 语法，同时支持 ts。尽管已经有很多的node框架，如express，koa等，但 nest 解决了架构问题，即提供了<code>模块化</code>结构，适用于构建企业级应用。

对于初次认识nest的人，nest中很多晦涩的概念和名词让人望而却步，当我使用 nest 完整的构建了本博客的服务后，逐渐有了一些新的认识，希望用朴实的语句来表达清楚nest涉及到的一些概念，以及当一个请求进入时nest的处理流程。

## nest的模块化

通常对于模块化的理解，之前在[模块化学习](https://zhuanlan.zhihu.com/p/139379663)里提到如 commonjs，amd，es module等，模块化的提出最终解决了变量作用域与模块间依赖关系的问题。

而在nest里的模块化是更通俗的，日志可以看做是一个模块，数据库orm可以看做是一个模块，在需要的时候引入即可，业务功能里如用户相关可以看做一个模块，文章相关，认证相关等等，都可以抽象为一个模块。每个模块包含相关内容的一系列操作，模块可以导出或相互引用。所以和 commonjs 它们的理念是一样的，只不过 nest 底层实现了自己的模块化系统来处理模块的导入导出与依赖关系。

当一个新的框架出现时，必然伴随着某些设计思路或模式，支撑 nest 的模块化系统则是控制反转和依赖注入。

### 控制反转

对于控制反转，其实可以理解为当你在代码显性的写了一行 let userService = new UserService()，实例化的过程和位置是你自主控制的，这种可以叫做正向控制，而如果你只是配置 UserService 作为用户模块的依赖，框架为你自动实例化，你便可以直接使用 userService里的方法，这种叫做控制反转，只是一个概念而已。

简单点来说，你自己操作DOM属于正向控制，你按照框架的约定定义组件属于控制反转，dom插入移除事件绑定移交给了框架。

在nest里控制反转的实现就是约定开发者配置 @Module：

```js
// user.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([UserInfoEntity])], // 导入依赖
  controllers: [UserController], 
  providers: [UserService],  // 导入依赖
  exports: [UserService], // 导出依赖
})
export class UserModule {}
```

**开发者交出了类的实例化权利，只是配置其作为依赖。**

还有一个很形象的例子，一个人本来是自己开车去上班的，他的目的就是到达公司。它自己开车，自己控制路线。而如果去赶公交，相当于交出了开车的控制权，此时他只需要选择乘坐那辆公交。此时公交系统就是控制器，控制所有公交车及其行驶路线，你只需要选择合适的公交。从控制来说，人被解放出来了，只需要记住坐那趟公交就行了，犯错的几率也小了，人也轻松了不少。

### 依赖注入

常见的依赖注入如：

```js
class UserService {}
class AuthService {}
class AuthModule {
   constructor (authService, userService) {
      this.authService = authService
      this.userService = userService
   }
}
const authService = new AuthService()
const userService = new UserService()
const authModule = new AuthModule(authService, userService)
```

将 AuthModule 需要的依赖通过传值的方式注入进去，这只是依赖注入的一种形式，只要通过某种方法将依赖给到就可以，执行某方法或直接赋值都行，也是一个很概念性的东西。

前面提到，nest 的控制反转是通过@Module实现的，可以细看一下。

### @Module 分析

在nest，模块是使用@Module装饰器的类，每个应用都至少一个模块，即根模块，根模块可拥有众多子模块。nest约定配置模块的 imports、exports、providers 管理类的依赖关系。

```js
@Module({
  imports: [UserModule], 
  controllers: [AuthController],
  providers: [AuthService]，
  exports:[AuthService]
})
export class AuthModule {}
```

如[官方文档](https://docs.nestjs.cn/8/modules?id=%e6%a8%a1%e5%9d%97)所示：
> @module() 装饰器接受一个描述模块属性的对象：
>
> - providers      由 Nest 注入器实例化的提供者，并且可以至少在整个模块中共享
> - controllers 必须创建的一组控制器
> - imports 导入模块的列表，这些模块导出了此模块中所需提供者
> - exports 由本模块提供并应在其他模块中可用的提供者的子集。

1 在一个认证模块里，我们需要一个处理用户认证相关的服务，如登录时用户的信息验证，或者颁发签证等操作，把这些操作集合起来构成认证模块的一个服务，nest规定这个服务必须放在 providers 里，在nest中也被叫做提供者。

```js
@provider()
export class AuthService {
  constructor(
    private readonly userService: UserService
  ) {}

  async validateUser(userDto) {
    const { username } = userDto;
    const user = await this.userService.getUserByName(username);
    if (!user) return null;
    if (comparePass(userDto.password, user.password)) {
      const { id, username, role } = user;
      return { id, username, role };
    }
    return null;
  }
 ...
}
```

2 一个路由进来时，需要由路由处理程序处理，在nest中，则是带有 @Controller 装饰器的类，调用 Providers 提供的类完成任务

```js
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  @Post('login')
  async login(@Body() userDto) {
    return this.authService.validateUser(userDto);
  }
  ...
}
```

**关于依赖共享**

一般用户模块需要 userService 服务，认证模块也需要userService提取用户信息，nest里规定要在用户模块配置里导出该服务，并在认证模块配置里引入用户模块

```js
// user.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([UserInfoEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // 导出给其他模块使用
})
export class UserModule {}

// auth.module.ts 
@Module({
  imports: [UserModule],  // 引入该模块，则可以使用该模块导出的 UserService
  controllers: [AuthController],
  providers: [ AuthService]，
})
export class AuthModule {}
```

此时 ，认证模块里类 AuthModule， AuthController 和 AuthService 都可以添加UserService服务。

nest 内置控制器会在实例化 UserService 后，将其分别注入到认证模块和用户模块需要的地方，他们实际上使用的是**同一个实例化后的 UserService**

### 装饰器

模块是由 @Module 装饰的类，实际上 nest 中有众多的装饰器，它们由@nestjs/common导出，是nest应用的重要组成部分，大致分为三类：

- http 相关，常用的如 @Get @Post..., @Req（等同 @Requst），@Res (等同 @Response)  ，@Body，@Param，@Query 等
- 模块相关， @Module 定义一个模块，@Global 则标识一个模块为全局模块，通常为根模块
- 其他核心的装饰器，@Controller 修饰路由控制器，@Injectable修饰服务等

<img src="https://mini-orange.cn/assets/image/ddf752e4926b9e243028a272efa6e5f4.png" alt="" class="md-img" width="600" height="515" loading="lazy"/>

除此之外，我们也可以根据需要定义自己的装饰器

```js
@testable // 修饰类
class MyTestableClass {
    @readonly // 修饰类
    name = 123

    set data(value) {
        this.name = value;
    }
}

function testable(target) {
    target.isTestable = true;
}

function readonly(target, name, descriptor) {
    descriptor.writable = false;
    return descriptor;
}
console.log(MyTestableClass.isTestable); // true

const test = new MyTestableClass()
test.name = 222 
console.log(test.name); // 123
```

也可以给装饰器传参

```js
@testable(true)
class MyTestableClass {}

function testable(data) {
  return (target) => {
    target.isTestable = data;
  }
}
console.log(MyTestableClass.isTestable); // true
```

**装饰器的使用场景：**

1. 修改类属性或方法的描述符 ，比如只读，不可枚举

2. 使用装饰器为类增加属性/方法/元数据等，还可以实现 mixin的效果

3. 修改类原有方法以扩充新的功能等

而nest中的装饰器几乎清一色的都是**为类/属性/方法添加元数据**，可以说 nest应用就是一个元数据驱动的系统。

### 元数据

元数据是用来描述数据的数据。元数据最大的好处是，它使信息的描述和分类可以实现格式化，从而为机器处理创造了可能。

描述人的元数据如性别、年龄、籍贯、血型等，描述手机如型号、内存、芯片等，一级元数据下面可能还有二级元数据，比如芯片是几核的，产自那里，产自时间等。

nest 里所有的元数据见 packages/common/constants.ts

```js
export const MODULE_METADATA = { // 为模块增加以下元数据（@Module）
  IMPORTS: 'imports',
  PROVIDERS: 'providers',
  CONTROLLERS: 'controllers',
  EXPORTS: 'exports',
};
export const GLOBAL_MODULE_METADATA = '__module:global__'; // 标识其为全局模块（@Global）
export const HOST_METADATA = 'host'; // 为路由控制器设置 host （@Controller）
export const PATH_METADATA = 'path'; // 为路由控制器设置 path （@Controller）
export const PARAMTYPES_METADATA = 'design:paramtypes'; 
export const SELF_DECLARED_DEPS_METADATA = 'self:paramtypes';
export const OPTIONAL_DEPS_METADATA = 'optional:paramtypes';
export const PROPERTY_DEPS_METADATA = 'self:properties_metadata';
export const OPTIONAL_PROPERTY_DEPS_METADATA = 'optional:properties_metadata';
export const SCOPE_OPTIONS_METADATA = 'scope:options';
export const METHOD_METADATA = 'method';
export const ROUTE_ARGS_METADATA = '__routeArguments__';
export const CUSTOM_ROUTE_AGRS_METADATA = '__customRouteArgs__';
...
```

#### 再看 @Module

```js
export function Module(metadata: ModuleMetadata): ClassDecorator {
  const propsKeys = Object.keys(metadata);
  validateModuleKeys(propsKeys); // 检测是否有多余的（metadata以外）属性

  return (target: Function) => {
    for (const property in metadata) {
      if (metadata.hasOwnProperty(property)) { // 检测是否有（除了原型）某属性
        // 为 target 上添加元数据 imports / exports/ controller/providers
        Reflect.defineMetadata(property, (metadata as any)[property], target);
      }
    }
  };
}
```

当然我们也可以使用 Reflect.getMetadata 获取

<img src="https://mini-orange.cn/assets/image/6d344af6e759a6dc9e12c3fbc4112480.png" alt="" class="md-img" loading="lazy" width="600"/>

关于 metadata 的操作，可查看 [Metadata Proposal - ECMAScript](https://rbuckton.github.io/reflect-metadata/)

#### 其他如 @Controller，@Injectable

```js
// 修饰路由控制器
export function Controller(
  prefixOrOptions?: string | string[] | ControllerOptions,
): ClassDecorator {
  ... 一些判断
  return (target: object) => {
    Reflect.defineMetadata(CONTROLLER_WATERMARK, true, target);
    Reflect.defineMetadata(PATH_METADATA, path, target);
    Reflect.defineMetadata(HOST_METADATA, host, target);
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, scopeOptions, target);
    Reflect.defineMetadata(VERSION_METADATA, versionOptions, target);
  };
}

// 修饰 provider，只要是使用了 Injectable 的类，都可以成为 nest 中的提供者
export function Injectable(options?: InjectableOptions): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
  };
}
```

#### 自定义 metadata

除了nest定义的元数据，我们也可以自定义元数据

1 是使用 Reflect.defineMetadata 自定义，取出使用 Reflect.getMetadata

```js
// 定义一个添加用户角色的装饰器
export const Roles = (roles: RoleEnum[]) => {
  return (target, key, descriptor) => {
    Reflect.defineMetadata('roles', roles, descriptor.value);
    return descriptor;
  };
};
```

2 是使用 nest 封装的 setMetadata

```js
export const Roles = (roles: RoleEnum[]) => SetMetadata('roles', roles);
```

setMetadata 内部则是调用了 Reflect.defineMetadata， 并且区分了 类和类的属性，有descriptor代表是类的属性或方法，没有则是类本身

```js
export const SetMetadata = <K = string, V = any>(
  metadataKey: K,
  metadataValue: V,
): CustomDecorator<K> => {
  const decoratorFactory = (target: object, key?: any, descriptor?: any) => {
    if (descriptor) { // 属性/方法
      Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(metadataKey, metadataValue, target);
    return target;
  };
  decoratorFactory.KEY = metadataKey;
  return decoratorFactory;
};
```

取出可以使用 nest 内置的 Reflector

```js
const roles = this.reflector.get('roles', context.getHandler()); // 从控制器注解中得到的角色组信息

// 也可以 Reflect.getMetadata
Reflect.getMetadata('roles', context.getHandler());
```

Reflector 被称为反射器，其实就是nest自己封装的一个辅助类，是对 Reflect 操作 metadata 的部分封装，用于更方便的提取数据

```js
export class Reflector {
  public get (metadataKey, target) { // 提取某元数据
    return Reflect.getMetadata(metadataKey, target) as TResult;
  }
  public getAll(metadataKey,targets ){ // 提取一系列对象的某元数据集合
    return (targets || []).map(target =>Reflect.getMetadata(metadataKey, target) )
  }
  public getAllAndMerge(metadataKey, targets) { // 提取一系列对象的某元数据集合并拍平合并
     ...
  }
  public getAllAndOverride(metadataKey,  targets) { // 提取一系列对象的某元数据集合拍平合并后返回第一个
    const metadataCollection = this.getAll(metadataKey, targets).filter(
      item => item !== undefined,
    );
    return metadataCollection[0];
  }
}
```

### 小结

1 至此我们对nest应用有了一个大致的了解，它是模块化的，我们只需使用@Module修饰类并定义元数据（imports / exports / providers），程序启动时nest从@Global修饰的根模块开始，扫描各个模块的配置，提取元数据并实例化类，如果某个类同时被export导出，则被视为可共享的，如果某个模块imports了该类所处模块，则共享此模块exports的所有服务，nest 会自动为其注入。

2 nest应用涵盖了大量的装饰器，他们几乎清一色都是为类或属性添加元数据，并且，几乎所有的核心数据都以元数据的形式存在，nest是一个元数据驱动的应用程序。

## 请求全链路探索

nest 全链路中涉及到像中间件熟知的东西，也提出了像守卫、拦截器、管道、异常过滤器的概念，搞清楚它们使用场景与执行顺序至关重要。

### 中间件

nest 底层默认使用 express 作为http服务器，当调用 app.use 时实际上调用的就是 express 的use方法

```js
// packages/platform-express/adapters/express-adapter.ts
export class ExpressAdapter extends AbstractHttpAdapter {
  ...
  constructor(instance?: any) {
    super(instance || express()); // 创建http服务器
  }
  ...
}

// packages/core/adapters/http-adapter.ts
export abstract class AbstractHttpAdapter<
  TServer = any,
  TRequest = any,
  TResponse = any,
> implements HttpServer<TRequest, TResponse>
{
  constructor(protected instance?: any) {}
  public use(...args: any[]) {
    return this.instance.use(...args); //
  }

  public get(handler: RequestHandler);
  public get(path: any, handler: RequestHandler);
  public get(...args: any[]) {
    return this.instance.get(...args); //
  }
  ...
}
```

ExpressAdapter 在调用 NestFactory.create 应用初始化时被实例化，后期app使用use增加中间件，enableCors启用cors，listen，get / post等都将转发到 express 上。

但实际上 nest的中间件执行稍有区别，对于一下代码

```js
app.use(async (req, res, next) => {
  console.log('mid1 start');
  next();
  console.log('mid1 end');
})

app.use(async (req, res, next) => {
  console.log('mid2 start');
  next();
  console.log('mid2 end');
})
app.get('/', (req, res) => {
  console.log('handler');
  res.end('handler')
})
```

express 的打印顺序则是: mid1 start  -> mid2 start  -> handler  -> mid2 end  -> mid1 end

因为 nest 执行机制不同，顺序则是 mid1 start  -> mid2 start -> mid2 end  -> mid1 end -> handler

### 守卫

守卫常用于授权，访问控制，所以是一个前置检查，没有权限后续操作就没有必要了，一个根据用户角色限制权限的例子如:

```js
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    console.log('guard global') // 将其注册为全局守卫
    // this.reflector 就是前面所说的 next 封装的一个辅助类，是对 Reflect 操作 metadata 的部分封装
    // 也可以直接用 Reflect.getMetadata('roles', context.getHandler())
    const roles = this.reflector.get<number[]>('roles', context.getHandler()); // 利用上文的 @Roles 为路由增加可访问角色列表
    if (!roles || roles.length === 0) return true; // 没有角色控制返回 true，表示所有人可访问
    const request = context.switchToHttp().getRequest();
    const user = request.session.passport.user;
    if (!user) throw new ApiException(ApiErrorCode.NOT_LOGIN); // 必须先登录吧
    if (roles.some((r) => r === Number(user.role))) return true; // 用户角色在列表内
    throw new ApiException(ApiErrorCode.NOT_HAVE_AUTH); // 否则报错，若返回false，nest 则忽略当前请求
  }
}
```

1 守卫可设置为全局控制所有路由，也可以设置为某个模块下，或是具体到某个路由下

2 守卫执行与中间件之后，因此目前的打印顺序为  mid1 start  -> mid2 start -> mid2 end  -> mid1 end -> <code>guard global</code> -> handler

### 拦截器

拦截器有一系列功能，可以拦截函数的执行以及修改执行的结果

> 1 在函数执行之前/之后绑定额外的逻辑
> 
> 2 转换从函数返回的结果
>
> 3 转换从函数抛出的异常
>
> 4 扩展基本函数行为
>
> 5 根据所选条件完全重写函数 (例如, 缓存目的)

一个响应拦截修改结果的例子：

```js
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly logger: LoggerService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const start = Date.now();
    const errNo = ApiErrorCode.SUCCESS;
    const req: Request = context.switchToHttp().getRequest();
    const { url, method, query, body, params, user } = req;
    const logId = this.getLogid();
    console.log('interceptor start');

    return next.handle().pipe(
      map((data) => ({ // 修改响应结果
        start,
        end: Date.now(),
        spend: Date.now() - start,
        errNo,
        data,
        errStr: ApiErrorMap[errNo],
      })),
      tap((data) => { // 打log
        console.log('interceptor end');
        const msg = { logId, url, method, query, params, body, data, user };
        this.logger.log(msg, 'ResponseInterceptor');
      }),
    );
  }

  getLogid() {
    const namespace = cls.getNamespace('lemon');
    return namespace.get('logid');
  }
}
```

1 和守卫一样，拦截器可设置为全局控制所有路由，也可以设置为某个模块下，或是具体到某个路由下

2 拦截器执行在守卫之后，next 执行完结束，因此目前的打印顺序为  mid1 start  -> mid2 start -> mid2 end  -> mid1 end -> guard global -> <code>interceptor start</code> -> handler -> <code>interceptor end</code>

### 管道

管道，用作传输的意思，程序中好比给函数传参，在nest里，管道的作用就是去验证函数的参数是否合格，如果合格才去执行函数，不合格则抛出异常；除此验证，还可以转化参数，转化为函数需要的格式。

假设要验证一个 修改用户信息的输入 是否合格，合格的标准如下：

```js
export class UpdateUserDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  role?: number;
}
```

这种结构叫做DTO模式，data transfer object，定义了传输数据的格式，一般可以使用interface和class来定义dto模式，区别是class在编译后会被保留，因为它属于ES标准语法，而interface会在编译后被删除，属于ts成分，因为nest需要在运行时检查传入格式，所以使用class来描述dto以供运行时访问。

IsNotEmpty、IsNumber、IsOptional 等是从 class-validator 包引入，class-validator 允许使用基于装饰器和非装饰器的两种验证方式，提供 validate 方法，nest使用的是基于装饰器的验证。使用如下。

在路由上标识 body 的类型：

```js
@Put()
async updateUser(@Body() userDto: UpdateUserDto) {
  console.log('handler');
  ...
  return true
}
```

配合管道进行body类型验证：

```js
@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    /*
      value 是输入的数据，假设为 { username: '2222', id: 'xxx', password: '18444444444444' }
      metadata 则是从函数中提取的附加信息，包含类型说明与参数类型（如body query params）
      完整如：{ metatype: [class UpdateUserDto], type: 'body', data: undefined }
      data为传递给装饰器的字符串，例如 @Body('string')
     */
    const { metatype, type } = metadata;
    if (!metatype || !this.toValidate(metatype)) { // 如果没有类型限制，返回原始数据
      return value;
    }
    console.log('pipe validate');
    const object = plainToClass(metatype, value); // plainToClass，class-transformer 包导出，转换参数为可验证的类型对象。一个请求中的 body 数据是不包含类型信息的，Class-validator 需要使用前面定义过的 DTO，就需要做一个类型转换。
    const errors = await validate(object); // class-validator 提供，进行验证，失败则返回错误信息
    // 这里因为 id 类型错误，错误对象为：
    /* [
        ValidationError {
          target: UpdateUserDto {
            username: '2222',
            id: 'xxx',
            password: '18444444444444'
          },
          value: 'xxx',
          property: 'id',
          children: [],
          constraints: {
            isNumber: 'id must be a number conforming to the specified constraints'
          }
        }
      ] */
    if (errors.length) {
      throw new ValidationException(errors); // 一个自定义的错误类型
    }
    return value;
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

1 和守卫、拦截器一样，管道可设置为全局控制所有路由，也可以设置为某个模块下，或是具体到某个路由下，不同的是，管道可以具体到参数下，对路由的某个参数进验证或转换

比如删除用户：

```js
 @Delete()
  async removeUser(@Body('id', ParseIntPipe) id: number) {
    return await this.userService.removeUser(id);
  }
```

ParseIntPipe 是内置管道，对参数进行parseInt转换，如果结果是 NaN,则抛出 BadRequestException错误，提示语句："Validation failed (numeric string is expected)"

2 管道在拦截器的next.handle()里执行，管道执行完后进入路由函数处理，路由处理后进行拦截器的后半部分，因此目前的打印顺序为  mid1 start  -> mid2 start -> mid2 end  -> mid1 end -> guard global -> interceptor start -> <code>pipe validate</code> -> handler -> interceptor end

### 异常抛出

nest内置基础异常类 HttpException，用于在发生异常时返回给用户错误提示与状态码

```js
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

用户将收到以下响应：

```js
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

为了书写方便，继承自 HttpException，nest 内置如 UnauthorizedException （401）、NotFoundException（404）、ForbiddenException(403)等常见错误类。

一般为了更精准的反馈给用户具体的错误信息，比如用户名已存在注册失败，这里划分出一些业务错误码与对应的错误提示：

```js
export enum ApiErrorCode {
  LOGIN_EXPIRED = 10001,
  PARAM_ERROR = 10002,
  NOT_LOGIN = 10003,
  VALIDATE_ERROR = 10004,
  NOT_VALUABLE_USER_ID = 11005,
  NOT_HAVE_AUTH = 11006,
  USERNAME_REPEAT = 11007,
  ...
}

export const ApiErrorMap = {
  [ApiErrorCode.LOGIN_EXPIRED]: '登录过期',
  [ApiErrorCode.PARAM_ERROR]: '参数错误',
  [ApiErrorCode.NOT_LOGIN]: '用户未登录',
  [ApiErrorCode.VALIDATE_ERROR]: '验证异常',
  [ApiErrorCode.NOT_VALUABLE_USER_ID]: '用户不存在',
  [ApiErrorCode.NOT_HAVE_AUTH]: '无操作权限',
  [ApiErrorCode.USERNAME_REPEAT]: '用户名已存在',
  ...
};

```

此时可以自定义异常类 ApiException

```js
export class ApiException extends HttpException {
  public errorCode: ApiErrorCode;
  public errorMessage: string;

  constructor(
    errorCode: ApiErrorCode,
    errorMessage = '',
    status: HttpStatus = HttpStatus.OK,
  ) {
    super(errorMessage, status); // 自定义异常统一为 200
    this.errorCode = errorCode;
    this.errorMessage = errorMessage || ApiErrorMap[this.errorCode]; // 可只传递错误码
  }

  getErrorCode(): ApiErrorCode {
    return this.errorCode;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }
}
```

像前面使用管道进行参数类型验证，可自定义参数验证异常类 ValidationException

```js
export class ValidationException extends ApiException {
  public errors: ValidationError[];
  public errorMessage: string = ApiErrorMap[ApiErrorCode.PARAM_ERROR];

  constructor(errors: ValidationError[]) {
    super(ApiErrorCode.PARAM_ERROR);
    this.errors = errors;
  }

  getErrorMessage(): string {
    const detatils = [];
    this.errors.forEach((error) => {
      const { constraints } = error;
      for (const value of Object.values(constraints)) {
        detatils.push(value);
      }
    });
    return this.errorMessage + '：' + detatils.join('、');
  }
}
```

对于前面 updateUser 则返回 "参数错误：id must be a number conforming to the specified constraints",

对于直接抛出错误，如throw new Error('Forbidden')，或者是其他未知异常，非继承自HttpException的错误，用户统一收到以下响应：

```js
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

### 异常过滤器

实际上，如果没有异常过滤器，对于前面自定义的 ApiException 和 ValidationException 是无法正常使用的，用户收到的响应更多是以下，statusCode 是不正确的

```js
{
  "statusCode": 200,
  "message": "xxxx message"
}
```

因为 super(errorMessage, status) 没有正确传递给 HttpException 所需的参数，实际上我们也可以正确传递

```js
export class ApiException extends HttpException {
  public errorCode: ApiErrorCode;
  public errorMessage: string;

  constructor(
    errorCode: ApiErrorCode,
    errorMessage = '',
    status: HttpStatus = HttpStatus.OK,
  ) {
    super(
      {
        statusCode: errorCode,
        message: errorMessage || ApiErrorMap[errorCode],
        status,
      },
      status,
    );
  }
}
```

用户将收到

```js
{
    "statusCode": 11007,
    "message": "用户名已存在"
}
```

一般情况这是可以使用的，如果我们想捕获所有异常并且统一增加错误日志，则需要使用全局的异常过滤器，从上下文中拿到请求参数与响应数据及错误码、http状态码，一并打到日志里，因为我们只能从 httpException 获取到 http status，而无法拿到具体的业务错误码，因此需要继承自 HttpException 提供可以获取到错误码的方法或属性，如 getErrorCode、getErrorMessage

```js
@Catch(HttpException, ApiException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}
  catch(exception: Error, host: ArgumentsHost) {
    console.log('expection filter');

    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const { url, method, query, params, body, user } = req;
    let responseData = {};

    if (exception instanceof HttpException) {
      const status = exception.getStatus(); // 提取 http status
      const errNo = (exception as any)?.getErrorCode?.() || status; // 提取状态码
      const errStr =
        (exception as any)?.getErrorMessage?.() || exception.getResponse(); // 提取错误信息

      responseData = {
        errNo,
        errStr: errStr.message || errStr,
        data: null,
        date: new Date().toISOString(),
        path: req.url,
      };

      res.status(status).json(responseData); // 修改异常响应格式
    } else { // 对于非继承自 HttpException 的异常统一返回
      const status = 500;
      responseData = {
        errNo: status,
        errStr: exception.message || '服务器内部异常',
        date: new Date().toISOString(),
        path: req.url,
      };
      res.status(status).json(responseData); // 修改异常响应格式
    }

    const logId = this.getLogid();
    const msg = {
      logId,
      url,
      method,
      query,
      params,
      body,
      user,
      data: responseData,
    };
    this.logger.error(msg, 'HttpExceptionFilter'); // 统一异常log格式
  }

  getLogid() {
    const namespace = cls.getNamespace('lemon');
    return namespace.get('logid');
  }
}
```

1 至此，全局所有的异常都会经过异常过滤器，当捕获到未处理的异常（如 typeorm 等操作导致的异常）时，最终用户将收到友好的响应。

2 无论是中间件，守卫、拦截器，管道，或者是函数执行时抛出的异常，执行顺序都会从抛出错误的那一刻转至 -> <code>expection filter</code>，然后打个log结束整个请求周期

### 上下文 ArgumentsHost

以上，可以观察到，

- 中间件可以拿到 request response next
- 守卫可以拿到 ExecutionContext
- 拦截器可以拿到 ExecutionContext 和 CallHandler
- 管道可以拿到 value 和 ArgumentMetadata
- 过滤器可以拿到 exception 和 ArgumentsHost

通过这些参数，我们拿到了必要的数据去运行程序，那他们是从那里来的呢？

中间件的request response不难理解，这是express在执行中间件的时候将其作为参数传递的，那 <code>ExecutionContext</code> 和 <code>ArgumentsHost</code> 是什么呢？

```js
/**
  提供用于查找传递给处理程序的参数的方法。
  允许选择适当的执行上下文(例如，Http, RPC，或  WebSockets)来查找参数。
 */
export interface ArgumentsHost {
  /**
   * 返回传递给处理程序的参数数组，即[request 对象，response对象，next函数]
   */
  getArgs<T extends Array<any> = any[]>(): T;
  /**
   * 通过索引查询参数
   */
  getArgByIndex<T = any>(index: number): T;
  /**
   * nest 支持不同类型应用：http、websocket 微服务（rpc），并且一个应用可以同时包含这些场景，
   * 在获取特定平台的参数需要切换context才能使用特定的方法
   */
  switchToRpc(): RpcArgumentsHost;
  switchToHttp(): HttpArgumentsHost;
  switchToWs(): WsArgumentsHost;
  /**
   * 返回当前context类型，如果是http服务返回http，websocket就是ws，微服务则为rpc
   */
  getType<TContext extends string = ContextType>(): TContext;
}
```

可以具体看看 switchToRpc、toHttp、toWs，为每个平台提供特定的API

```js
/**
 * 切换到http 获取请求和响应对象
 */
export interface HttpArgumentsHost {
  getRequest<T = any>(): T;
  getResponse<T = any>(): T;
  getNext<T = any>(): T;
}

/**
 * 切换到ws 获取传输的数据和客户端对象 
 */
export interface WsArgumentsHost {
  getData<T = any>(): T;
  getClient<T = any>(): T;
}

/**
 * 切换到rpc 获取数据与执行上下文对象
 */
export interface RpcArgumentsHost {
  getData<T = any>(): T;
  getContext<T = any>(): T;
}
```

ExecutionContext 继承自 ArgumentsHost，提供了一些获取当前请求的细节

```js
export interface ExecutionContext extends ArgumentsHost {
  /**
   * 返回当前处理程序所属的控制器类。如 [class UserController]
   */
  getClass<T = any>(): Type<T>;
  /**
   * 获取当前路由处理函数的引用，如 [AsyncFunction: updateUser]
   * 在前面守卫的例子里，我们通过 reflector 获取了它的元数据 roles
   */
  getHandler(): Function;
}
```

以上可以得到的结论是，从http服务来讲，ArgumentsHost 提供了获取请求和响应对象的方法，它会被传入到守卫，拦截器，异常过滤器中，打通整个请求响应链路。

前面介绍的都是 interface，可以看下每个方法的具体实现，在 packages/core/helpers/execution-context-host.ts

```js
export class ExecutionContextHost implements ExecutionContext {
  private contextType = 'http';

  constructor(
    private readonly args: any[],
    private readonly constructorRef: Type<any> = null,
    private readonly handler: Function = null,
  ) {}

  setType<TContext extends string = ContextType>(type: TContext) {
    type && (this.contextType = type);
  }

  getType<TContext extends string = ContextType>(): TContext {
    return this.contextType as TContext;
  }

  getClass<T = any>(): Type<T> {
    return this.constructorRef;
  }

  getHandler(): Function {
    return this.handler;
  }

  getArgs<T extends Array<any> = any[]>(): T {
    return this.args as T;
  }

  getArgByIndex<T = any>(index: number): T {
    return this.args[index] as T;
  }

  switchToRpc(): RpcArgumentsHost {
    return Object.assign(this, {
      getData: () => this.getArgByIndex(0),
      getContext: () => this.getArgByIndex(1),
    });
  }

  switchToHttp(): HttpArgumentsHost {
    return Object.assign(this, { 
      getRequest: () => this.getArgByIndex(0),
      getResponse: () => this.getArgByIndex(1),
      getNext: () => this.getArgByIndex(2),
    });
  }

  switchToWs(): WsArgumentsHost {
    return Object.assign(this, {
      getClient: () => this.getArgByIndex(0),
      getData: () => this.getArgByIndex(1),
    });
  }
}
```

从 switchToHttp 可以看到是从 args 中取得request与response next，和中间件的三个参数是一样的，只是做了一层封装。

#### cls-hooked

到此为止，我们可以拿到的上下文数据都是nest提供给我们的，如果我们想在整个请求链路如插入一条自定义的数据呢，比如 logid，让同一个请求在任何地方的log都有同一个id，以便进行链路追踪，最简单的方法是全局变量, 但是这样在并发场景下会被覆盖啊。。。还是使用社区提供的方案吧 [cls-hooked](https://www.npmjs.com/package/cls-hooked)

```js
export function clsMiddleware(req: Request, res: Response, next: NextFunction) {
  const namespace = cls.createNamespace('lemon'); // 创建命名空间
  const logId = Date.now() + Math.random().toString(36).slice(5, 10); // 随机 logId
  // 创建一个可以在其上设置或读取值的新上下文
  namespace.run(() => {
    namespace.set('logid', logId);
    namespace.set('currReq', req);
    next();
  });
}
```

此后在同一请求的任意地方获取的 logid 是一样的

```js
getLogid() {
  const namespace = cls.getNamespace('lemon');
  return namespace.get('logid');
}
```

### 进一步分析

前面我们最终得到的顺序是：mid1 start  -> mid2 start -> mid2 end  -> mid1 end -> guard global -> interceptor start -> pipe validate -> handler -> interceptor end

1 无论是全局性的，某个模块上的 或是某个路由上，顺序永远都是 所有的middleware -> 所有的quard -> 所有的interceptor -> 所有的pipe -> 再到具体的执行函数

2 任何环节抛出了 exception，都会中断后续流程，以全局 exception filter 结束

#### 守卫、拦截器、管道

nest 在初始化时，根据参数config创建http服务器，然后从根模块开始读取配置（配置以元数据的形式存在），建立依赖关系，实例化module；app.listen 后拿着 http服务器与配置中拿到的 controller 便开始进行路由注册，涉及到与守卫等执行流程关系较大的一个方法如下：

```js
// packages/core/router/router-execution-context.ts
public create( // 返回请求进来后最终执行的函数
  instance: Controller, // 控制器实例
  callback: (...args: any[]) => unknown, // 请求执行函数
  methodName: string, // 请求执行函数名
  moduleKey: string,
  requestMethod: RequestMethod, // http method
  contextId = STATIC_CONTEXT,
  inquirerId?: string,
) {
  const contextType: ContextType = 'http';
  const {
    argsLength,
    fnHandleResponse,
    paramtypes,
    getParamsMetadata,
    httpStatusCode,
    responseHeaders,
    hasCustomHeaders,
  } = this.getMetadata(
    instance,
    callback,
    methodName,
    moduleKey,
    requestMethod,
    contextType,
  );

  const paramsOptions = this.contextUtils.mergeParamsMetatypes(
    getParamsMetadata(moduleKey, contextId, inquirerId),
    paramtypes,
  );
  /* 
    guard interceptor pipe 都有对应的 ContextCreator
    任何 contextCreator 都继承自 ContextCreator 类，用来提取配置的所有 guard interceptor pipe
  */
  const pipes = this.pipesContextCreator.create(
    // 提取全局、controller上、方法上的所有有效的pipe(即实现了PipeTransform接口，有transform方法）
    instance,
    callback,
    moduleKey,
    contextId,
    inquirerId,
  );
  const guards = this.guardsContextCreator.create(
    // 提取全局、controller上、方法上的所有有效的guard(即实现了CanActivate接口，有canActivate方法）
    instance,
    callback,
    moduleKey,
    contextId,
    inquirerId,
  );
  const interceptors = this.interceptorsContextCreator.create(
    // 提取全局、controller上、方法上的所有有效的interceptor(即实现了NestInterceptor接口，有intercept方法）
    instance,
    callback,
    moduleKey,
    contextId,
    inquirerId,
  );

  /* 
    返回一个执行所有守卫的函数, 入参为 res req next
    在执行 guard 的canActivate方法时，传入的context 为 
    new ExecutionContextHost(
      args, // [req,res,next]
      instance.constructor as any, // getClass的返回
      callback, // getHandler的返回
    );
  */

  /* guard interceptor pipe 也都有自己的consumer，用来消费他们
     createGuardsFn 借助 guardsConsumer.tryActivate 生成执行函数 
     createPipesFn 借助 pipesConsumer.apply 生成执行函数 
     interceptors 使用了 interceptorsConsumer.intercept

     无论是哪一个，他们都需要上下文，统一 new  ExecutionContextHost() 生成
   */ 
  const fnCanActivate = this.createGuardsFn(
    guards,
    instance,
    callback,
    contextType,
  );
  
  // 返回一个执行所有管道的函数, 入参为 args（callback的参数） req res next
  const fnApplyPipes = this.createPipesFn(pipes, paramsOptions);

  // 先执行管道，再执行callback
  const handler =
    <TRequest, TResponse>(
      args: any[],
      req: TRequest,
      res: TResponse,
      next: Function,
    ) =>
    async () => {
      fnApplyPipes && (await fnApplyPipes(args, req, res, next));
      return callback.apply(instance, args);
    };

  return async <TRequest, TResponse>(
    req: TRequest,
    res: TResponse,
    next: Function,
  ) => {
    const args = this.contextUtils.createNullArray(argsLength);
    fnCanActivate && (await fnCanActivate([req, res, next]));  // 1 guard

    this.responseController.setStatus(res, httpStatusCode);
    hasCustomHeaders &&
      this.responseController.setHeaders(res, responseHeaders);

    const result = await this.interceptorsConsumer.intercept( // 2 interceptors
      interceptors,
      [req, res, next],
      instance,
      callback,
      handler(args, req, res, next), // 3 pipe -> callback
      contextType,
    );
    await (fnHandleResponse as HandlerResponseBasicFn)(result, res, req);
  };
}
```

其中 interceptor 和中间件类似，属于面向切面编程，next执行后将控制权交给下一个处理程序，所有interceptor走完后再回来，不过express的中间件和nest的interceptor实现的方式不一样，express 借助promise，nest除了promise还有用到rxjs。

#### 再看异常过滤器

nest 使用 try/catch 捕获错误，有错误直接将错误和上下文传给catch

```js
export class RouterProxy {
  public createProxy(
    targetCallback: RouterProxyCallback,
    exceptionsHandler: ExceptionsHandler,
  ) {
    return async <TRequest, TResponse>(
      req: TRequest,
      res: TResponse,
      next: () => void,
    ) => {
      try {
        await targetCallback(req, res, next); // 执行路由callback
      } catch (e) {
        const host = new ExecutionContextHost([req, res, next]); // 生成上下文
        exceptionsHandler.next(e, host);
      }
    };
  }
  ...
}


export class ExceptionsHandler extends BaseExceptionFilter {
  private filters: ExceptionFilterMetadata[] = [];
  public next(exception: Error | HttpException | any, ctx: ArgumentsHost) {
    if (this.invokeCustomFilters(exception, ctx)) {
      return;
    }
    super.catch(exception, ctx); // 执行 exception filter 定义的 catch
  }
  ...
}
```

### 认证

认证也是执行链中的重要组成部分，有很多方法和策略，这里使用 <code>passport</code>，主要分为三个验证步骤：

1. 通过用户名、密码（或 json web令牌）验证用户身份

2. 管理身份验证状态或信息，比如 express session 或持久化到redis

3. 将有关经过身份验证的用户信息附加到请求对象上，以便在路由处理程序中进一步使用

以用户名密码为例，使用 <code>passport-local</code> 策略，因为它实现了用户名，密码身份验证机制

```js
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ passReqToCallback: true });
  }
  // Passport 将基于 validate() 方法的返回值构建一个user 对象，并将其作为属性附加到请求对象上。
  async validate(
    @Request() req,
    username: string,
    password: string,
  ): Promise<any> {
    const user = await this.authService.validateUser({ username, password });
    if (!user) {
      throw new ApiException(
        ApiErrorCode.TABLE_OPERATE_ERROR,
        '用户名或密码错误',
      );
    }
    // 用户名密码匹配，设置session
    // promisify，统一代码风格，将node式callback转化为promise
    await promisify(req.login.bind(req))(user);
    return user;
  }
}
```

使用如下：

```js
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(/* req.session.passport.user */ req.user);
  }
```

认证以守卫为载体，AuthGuard 是nest内置的守卫，连接passport策略专门用来认证

```js
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    if (gqlContext) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
```

当某请求需要进行用户验证时，也可以通过扩展自定义 passport 策略实现

```js
@Injectable()
export class SessionStrategy extends PassportStrategy(
  Strategy,
  'applySession',
) {
  async validate(@Request() req): Promise<any> {
    console.log('authGuard session')
    const { passport } = req.session;
    if (!passport?.user) { // 请求对象上无用户信息
      throw new UnauthorizedException();
    }
    const { id, username, role } = passport.user;
    return {
      id,
      username,
      role,
    };
  }
}
```

使用如下，依旧是 AuthGuard

```js
  @UseGuards(AuthGuard('applySession'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
```

至此，当一个需要认证的请求过来时：

1 认证成功：mid1 start  -> mid2 start -> mid2 end  -> mid1 end -> guard global -> <code>authGuard session</code> -> interceptor start -> pipe validate -> handler -> interceptor end

2 认证失败：mid1 start  -> mid2 start -> mid2 end  -> mid1 end -> guard global -> <code>authGuard session</code> -> exception filter(401 Unauthorized)

至此，我们便完整的梳理完请求进来的全过程。

## 总结

1 nest 提供了模块化的结构，以class为载体，使用装饰器（@Module）结合元数据（imports/exports/controller/provider)来识别模块及其依赖，在nest中，以<code>@Injectable</code>修饰的class皆可成为提供者（provider），controller下的service是提供者，guard pipe interceptor 也是。支撑模块及其依赖正确运作的原理是控制反转与依赖注入，它们也只是一个思想而已，具体有很多实现方法。相对于其他的node框架，在nest里各个功能，各个业务模块可以有良好的划分，虽然在起初有像守卫，管道等模糊的概念，但一番了解下来会发现他们所承载的功能是应用里必不可少的一部分，nest对一个后台应用所需的内容进行了功能划分（拆解出如管道，守卫，拦截器，异常过滤器的东西），概念虽繁杂，可从整体来看，它们又可以统一叫做提供者（provider）。

<img src="https://mini-orange.cn/assets/image/5ca4836f44bba4711d90c18638baec5a.png" width="796" height="478" alt="" class="md-img" loading="lazy"/>

2 执行链关系图如下，任意环节出现 exception，都将终止后续流程，以exception filter结束

<img src="https://mini-orange.cn/assets/image/15acc044712ed958fd22835b0bfadf2a.png" width="796" height="198" alt="" class="md-img" loading="lazy"/>

另外的，guard,intercptor，exception filter 在用到上下文的时候，都取自ExecutionContext ，它是对 request，response，next的封装，贯穿整个执行链。

## 问题

在写的过程中还有一些的疑问得记录下：

1. passport 是怎么拿到session然后从redis获取用户信息附加到request对象上的，这个环节蛮重要但是代码里看不到哎
2. nest 用的是 express 中间件，为啥行为就不一致呢
3. 啊对，洋葱模型怎么实现的
4. cls-hooked 是如何实现的

## 附录

[Nestjs模块机制的概念和实现原理](https://www.cnblogs.com/1wen/p/16101124.html)

[阮一峰 元数据（MetaData）](http://www.ruanyifeng.com/blog/2007/03/metadata.html)

[《ECMAScript 6 入门》之装饰器](https://es6.ruanyifeng.com/#docs/decorator)

[Metadata Proposal - ECMAScript](https://rbuckton.github.io/reflect-metadata)

[node CLS 全链路追踪以及其实现原理](https://juejin.cn/post/6881931753720643591)
