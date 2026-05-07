import * as runtime from "@prisma/client/runtime/client";

//#region src/generated/prisma/models/User.d.ts
/**
 * Model User
 *
 */
type UserModel = runtime.Types.Result.DefaultSelection<$UserPayload>;
type AggregateUser = {
  _count: UserCountAggregateOutputType | null;
  _min: UserMinAggregateOutputType | null;
  _max: UserMaxAggregateOutputType | null;
};
type UserMinAggregateOutputType = {
  id: string | null;
  email: string | null;
  emailVerified: boolean | null;
  name: string | null;
  image: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  username: string | null;
  displayUsername: string | null;
  displayName: string | null;
};
type UserMaxAggregateOutputType = {
  id: string | null;
  email: string | null;
  emailVerified: boolean | null;
  name: string | null;
  image: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  username: string | null;
  displayUsername: string | null;
  displayName: string | null;
};
type UserCountAggregateOutputType = {
  id: number;
  email: number;
  emailVerified: number;
  name: number;
  image: number;
  createdAt: number;
  updatedAt: number;
  username: number;
  displayUsername: number;
  displayName: number;
  _all: number;
};
type UserMinAggregateInputType = {
  id?: true;
  email?: true;
  emailVerified?: true;
  name?: true;
  image?: true;
  createdAt?: true;
  updatedAt?: true;
  username?: true;
  displayUsername?: true;
  displayName?: true;
};
type UserMaxAggregateInputType = {
  id?: true;
  email?: true;
  emailVerified?: true;
  name?: true;
  image?: true;
  createdAt?: true;
  updatedAt?: true;
  username?: true;
  displayUsername?: true;
  displayName?: true;
};
type UserCountAggregateInputType = {
  id?: true;
  email?: true;
  emailVerified?: true;
  name?: true;
  image?: true;
  createdAt?: true;
  updatedAt?: true;
  username?: true;
  displayUsername?: true;
  displayName?: true;
  _all?: true;
};
type UserAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which User to aggregate.
   */
  where?: UserWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Users to fetch.
   */
  orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the start position
   */
  cursor?: UserWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Users from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Users.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Count returned Users
  **/
  _count?: true | UserCountAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to find the minimum value
  **/
  _min?: UserMinAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to find the maximum value
  **/
  _max?: UserMaxAggregateInputType;
};
type GetUserAggregateType<T extends UserAggregateArgs> = { [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count' ? T[P] extends true ? number : GetScalarType<T[P], AggregateUser[P]> : GetScalarType<T[P], AggregateUser[P]> };
type UserGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: UserWhereInput;
  orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[];
  by: UserScalarFieldEnum[] | UserScalarFieldEnum;
  having?: UserScalarWhereWithAggregatesInput;
  take?: number;
  skip?: number;
  _count?: UserCountAggregateInputType | true;
  _min?: UserMinAggregateInputType;
  _max?: UserMaxAggregateInputType;
};
type UserGroupByOutputType = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  username: string | null;
  displayUsername: string | null;
  displayName: string | null;
  _count: UserCountAggregateOutputType | null;
  _min: UserMinAggregateOutputType | null;
  _max: UserMaxAggregateOutputType | null;
};
type GetUserGroupByPayload<T extends UserGroupByArgs> = PrismaPromise<Array<PickEnumerable<UserGroupByOutputType, T['by']> & { [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : GetScalarType<T[P], UserGroupByOutputType[P]> : GetScalarType<T[P], UserGroupByOutputType[P]> }>>;
type UserWhereInput = {
  AND?: UserWhereInput | UserWhereInput[];
  OR?: UserWhereInput[];
  NOT?: UserWhereInput | UserWhereInput[];
  id?: StringFilter<"User"> | string;
  email?: StringFilter<"User"> | string;
  emailVerified?: BoolFilter<"User"> | boolean;
  name?: StringNullableFilter<"User"> | string | null;
  image?: StringNullableFilter<"User"> | string | null;
  createdAt?: DateTimeFilter<"User"> | Date | string;
  updatedAt?: DateTimeFilter<"User"> | Date | string;
  username?: StringNullableFilter<"User"> | string | null;
  displayUsername?: StringNullableFilter<"User"> | string | null;
  displayName?: StringNullableFilter<"User"> | string | null;
  accounts?: AccountListRelationFilter;
  sessions?: SessionListRelationFilter;
};
type UserOrderByWithRelationInput = {
  id?: SortOrder;
  email?: SortOrder;
  emailVerified?: SortOrder;
  name?: SortOrderInput | SortOrder;
  image?: SortOrderInput | SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  username?: SortOrderInput | SortOrder;
  displayUsername?: SortOrderInput | SortOrder;
  displayName?: SortOrderInput | SortOrder;
  accounts?: AccountOrderByRelationAggregateInput;
  sessions?: SessionOrderByRelationAggregateInput;
};
type UserWhereUniqueInput = AtLeast<{
  id?: string;
  email?: string;
  username?: string;
  displayUsername?: string;
  AND?: UserWhereInput | UserWhereInput[];
  OR?: UserWhereInput[];
  NOT?: UserWhereInput | UserWhereInput[];
  emailVerified?: BoolFilter<"User"> | boolean;
  name?: StringNullableFilter<"User"> | string | null;
  image?: StringNullableFilter<"User"> | string | null;
  createdAt?: DateTimeFilter<"User"> | Date | string;
  updatedAt?: DateTimeFilter<"User"> | Date | string;
  displayName?: StringNullableFilter<"User"> | string | null;
  accounts?: AccountListRelationFilter;
  sessions?: SessionListRelationFilter;
}, "id" | "email" | "username" | "displayUsername">;
type UserOrderByWithAggregationInput = {
  id?: SortOrder;
  email?: SortOrder;
  emailVerified?: SortOrder;
  name?: SortOrderInput | SortOrder;
  image?: SortOrderInput | SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  username?: SortOrderInput | SortOrder;
  displayUsername?: SortOrderInput | SortOrder;
  displayName?: SortOrderInput | SortOrder;
  _count?: UserCountOrderByAggregateInput;
  _max?: UserMaxOrderByAggregateInput;
  _min?: UserMinOrderByAggregateInput;
};
type UserScalarWhereWithAggregatesInput = {
  AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
  OR?: UserScalarWhereWithAggregatesInput[];
  NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[];
  id?: StringWithAggregatesFilter<"User"> | string;
  email?: StringWithAggregatesFilter<"User"> | string;
  emailVerified?: BoolWithAggregatesFilter<"User"> | boolean;
  name?: StringNullableWithAggregatesFilter<"User"> | string | null;
  image?: StringNullableWithAggregatesFilter<"User"> | string | null;
  createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string;
  updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string;
  username?: StringNullableWithAggregatesFilter<"User"> | string | null;
  displayUsername?: StringNullableWithAggregatesFilter<"User"> | string | null;
  displayName?: StringNullableWithAggregatesFilter<"User"> | string | null;
};
type UserCreateInput = {
  id?: string;
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  image?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  username?: string | null;
  displayUsername?: string | null;
  displayName?: string | null;
  accounts?: AccountCreateNestedManyWithoutUserInput;
  sessions?: SessionCreateNestedManyWithoutUserInput;
};
type UserUncheckedCreateInput = {
  id?: string;
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  image?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  username?: string | null;
  displayUsername?: string | null;
  displayName?: string | null;
  accounts?: AccountUncheckedCreateNestedManyWithoutUserInput;
  sessions?: SessionUncheckedCreateNestedManyWithoutUserInput;
};
type UserUpdateInput = {
  id?: StringFieldUpdateOperationsInput | string;
  email?: StringFieldUpdateOperationsInput | string;
  emailVerified?: BoolFieldUpdateOperationsInput | boolean;
  name?: NullableStringFieldUpdateOperationsInput | string | null;
  image?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  username?: NullableStringFieldUpdateOperationsInput | string | null;
  displayUsername?: NullableStringFieldUpdateOperationsInput | string | null;
  displayName?: NullableStringFieldUpdateOperationsInput | string | null;
  accounts?: AccountUpdateManyWithoutUserNestedInput;
  sessions?: SessionUpdateManyWithoutUserNestedInput;
};
type UserUncheckedUpdateInput = {
  id?: StringFieldUpdateOperationsInput | string;
  email?: StringFieldUpdateOperationsInput | string;
  emailVerified?: BoolFieldUpdateOperationsInput | boolean;
  name?: NullableStringFieldUpdateOperationsInput | string | null;
  image?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  username?: NullableStringFieldUpdateOperationsInput | string | null;
  displayUsername?: NullableStringFieldUpdateOperationsInput | string | null;
  displayName?: NullableStringFieldUpdateOperationsInput | string | null;
  accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput;
  sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput;
};
type UserCreateManyInput = {
  id?: string;
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  image?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  username?: string | null;
  displayUsername?: string | null;
  displayName?: string | null;
};
type UserUpdateManyMutationInput = {
  id?: StringFieldUpdateOperationsInput | string;
  email?: StringFieldUpdateOperationsInput | string;
  emailVerified?: BoolFieldUpdateOperationsInput | boolean;
  name?: NullableStringFieldUpdateOperationsInput | string | null;
  image?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  username?: NullableStringFieldUpdateOperationsInput | string | null;
  displayUsername?: NullableStringFieldUpdateOperationsInput | string | null;
  displayName?: NullableStringFieldUpdateOperationsInput | string | null;
};
type UserUncheckedUpdateManyInput = {
  id?: StringFieldUpdateOperationsInput | string;
  email?: StringFieldUpdateOperationsInput | string;
  emailVerified?: BoolFieldUpdateOperationsInput | boolean;
  name?: NullableStringFieldUpdateOperationsInput | string | null;
  image?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  username?: NullableStringFieldUpdateOperationsInput | string | null;
  displayUsername?: NullableStringFieldUpdateOperationsInput | string | null;
  displayName?: NullableStringFieldUpdateOperationsInput | string | null;
};
type UserCountOrderByAggregateInput = {
  id?: SortOrder;
  email?: SortOrder;
  emailVerified?: SortOrder;
  name?: SortOrder;
  image?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  username?: SortOrder;
  displayUsername?: SortOrder;
  displayName?: SortOrder;
};
type UserMaxOrderByAggregateInput = {
  id?: SortOrder;
  email?: SortOrder;
  emailVerified?: SortOrder;
  name?: SortOrder;
  image?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  username?: SortOrder;
  displayUsername?: SortOrder;
  displayName?: SortOrder;
};
type UserMinOrderByAggregateInput = {
  id?: SortOrder;
  email?: SortOrder;
  emailVerified?: SortOrder;
  name?: SortOrder;
  image?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  username?: SortOrder;
  displayUsername?: SortOrder;
  displayName?: SortOrder;
};
type UserScalarRelationFilter = {
  is?: UserWhereInput;
  isNot?: UserWhereInput;
};
type StringFieldUpdateOperationsInput = {
  set?: string;
};
type BoolFieldUpdateOperationsInput = {
  set?: boolean;
};
type NullableStringFieldUpdateOperationsInput = {
  set?: string | null;
};
type DateTimeFieldUpdateOperationsInput = {
  set?: Date | string;
};
type UserCreateNestedOneWithoutSessionsInput = {
  create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>;
  connectOrCreate?: UserCreateOrConnectWithoutSessionsInput;
  connect?: UserWhereUniqueInput;
};
type UserUpdateOneRequiredWithoutSessionsNestedInput = {
  create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>;
  connectOrCreate?: UserCreateOrConnectWithoutSessionsInput;
  upsert?: UserUpsertWithoutSessionsInput;
  connect?: UserWhereUniqueInput;
  update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>, UserUncheckedUpdateWithoutSessionsInput>;
};
type UserCreateNestedOneWithoutAccountsInput = {
  create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>;
  connectOrCreate?: UserCreateOrConnectWithoutAccountsInput;
  connect?: UserWhereUniqueInput;
};
type UserUpdateOneRequiredWithoutAccountsNestedInput = {
  create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>;
  connectOrCreate?: UserCreateOrConnectWithoutAccountsInput;
  upsert?: UserUpsertWithoutAccountsInput;
  connect?: UserWhereUniqueInput;
  update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAccountsInput, UserUpdateWithoutAccountsInput>, UserUncheckedUpdateWithoutAccountsInput>;
};
type UserCreateWithoutSessionsInput = {
  id?: string;
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  image?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  username?: string | null;
  displayUsername?: string | null;
  displayName?: string | null;
  accounts?: AccountCreateNestedManyWithoutUserInput;
};
type UserUncheckedCreateWithoutSessionsInput = {
  id?: string;
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  image?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  username?: string | null;
  displayUsername?: string | null;
  displayName?: string | null;
  accounts?: AccountUncheckedCreateNestedManyWithoutUserInput;
};
type UserCreateOrConnectWithoutSessionsInput = {
  where: UserWhereUniqueInput;
  create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>;
};
type UserUpsertWithoutSessionsInput = {
  update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>;
  create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>;
  where?: UserWhereInput;
};
type UserUpdateToOneWithWhereWithoutSessionsInput = {
  where?: UserWhereInput;
  data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>;
};
type UserUpdateWithoutSessionsInput = {
  id?: StringFieldUpdateOperationsInput | string;
  email?: StringFieldUpdateOperationsInput | string;
  emailVerified?: BoolFieldUpdateOperationsInput | boolean;
  name?: NullableStringFieldUpdateOperationsInput | string | null;
  image?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  username?: NullableStringFieldUpdateOperationsInput | string | null;
  displayUsername?: NullableStringFieldUpdateOperationsInput | string | null;
  displayName?: NullableStringFieldUpdateOperationsInput | string | null;
  accounts?: AccountUpdateManyWithoutUserNestedInput;
};
type UserUncheckedUpdateWithoutSessionsInput = {
  id?: StringFieldUpdateOperationsInput | string;
  email?: StringFieldUpdateOperationsInput | string;
  emailVerified?: BoolFieldUpdateOperationsInput | boolean;
  name?: NullableStringFieldUpdateOperationsInput | string | null;
  image?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  username?: NullableStringFieldUpdateOperationsInput | string | null;
  displayUsername?: NullableStringFieldUpdateOperationsInput | string | null;
  displayName?: NullableStringFieldUpdateOperationsInput | string | null;
  accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput;
};
type UserCreateWithoutAccountsInput = {
  id?: string;
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  image?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  username?: string | null;
  displayUsername?: string | null;
  displayName?: string | null;
  sessions?: SessionCreateNestedManyWithoutUserInput;
};
type UserUncheckedCreateWithoutAccountsInput = {
  id?: string;
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  image?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  username?: string | null;
  displayUsername?: string | null;
  displayName?: string | null;
  sessions?: SessionUncheckedCreateNestedManyWithoutUserInput;
};
type UserCreateOrConnectWithoutAccountsInput = {
  where: UserWhereUniqueInput;
  create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>;
};
type UserUpsertWithoutAccountsInput = {
  update: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>;
  create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>;
  where?: UserWhereInput;
};
type UserUpdateToOneWithWhereWithoutAccountsInput = {
  where?: UserWhereInput;
  data: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>;
};
type UserUpdateWithoutAccountsInput = {
  id?: StringFieldUpdateOperationsInput | string;
  email?: StringFieldUpdateOperationsInput | string;
  emailVerified?: BoolFieldUpdateOperationsInput | boolean;
  name?: NullableStringFieldUpdateOperationsInput | string | null;
  image?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  username?: NullableStringFieldUpdateOperationsInput | string | null;
  displayUsername?: NullableStringFieldUpdateOperationsInput | string | null;
  displayName?: NullableStringFieldUpdateOperationsInput | string | null;
  sessions?: SessionUpdateManyWithoutUserNestedInput;
};
type UserUncheckedUpdateWithoutAccountsInput = {
  id?: StringFieldUpdateOperationsInput | string;
  email?: StringFieldUpdateOperationsInput | string;
  emailVerified?: BoolFieldUpdateOperationsInput | boolean;
  name?: NullableStringFieldUpdateOperationsInput | string | null;
  image?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  username?: NullableStringFieldUpdateOperationsInput | string | null;
  displayUsername?: NullableStringFieldUpdateOperationsInput | string | null;
  displayName?: NullableStringFieldUpdateOperationsInput | string | null;
  sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput;
};
/**
 * Count Type UserCountOutputType
 */
type UserCountOutputType = {
  accounts: number;
  sessions: number;
};
type UserCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  accounts?: boolean | UserCountOutputTypeCountAccountsArgs;
  sessions?: boolean | UserCountOutputTypeCountSessionsArgs;
};
/**
 * UserCountOutputType without action
 */
type UserCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the UserCountOutputType
   */
  select?: UserCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * UserCountOutputType without action
 */
type UserCountOutputTypeCountAccountsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: AccountWhereInput;
};
/**
 * UserCountOutputType without action
 */
type UserCountOutputTypeCountSessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: SessionWhereInput;
};
type UserSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  email?: boolean;
  emailVerified?: boolean;
  name?: boolean;
  image?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  username?: boolean;
  displayUsername?: boolean;
  displayName?: boolean;
  accounts?: boolean | User$accountsArgs<ExtArgs>;
  sessions?: boolean | User$sessionsArgs<ExtArgs>;
  _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["user"]>;
type UserSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  email?: boolean;
  emailVerified?: boolean;
  name?: boolean;
  image?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  username?: boolean;
  displayUsername?: boolean;
  displayName?: boolean;
}, ExtArgs["result"]["user"]>;
type UserSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  email?: boolean;
  emailVerified?: boolean;
  name?: boolean;
  image?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  username?: boolean;
  displayUsername?: boolean;
  displayName?: boolean;
}, ExtArgs["result"]["user"]>;
type UserSelectScalar = {
  id?: boolean;
  email?: boolean;
  emailVerified?: boolean;
  name?: boolean;
  image?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  username?: boolean;
  displayUsername?: boolean;
  displayName?: boolean;
};
type UserOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "email" | "emailVerified" | "name" | "image" | "createdAt" | "updatedAt" | "username" | "displayUsername" | "displayName", ExtArgs["result"]["user"]>;
type UserInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  accounts?: boolean | User$accountsArgs<ExtArgs>;
  sessions?: boolean | User$sessionsArgs<ExtArgs>;
  _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>;
};
type UserIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
type UserIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
type $UserPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  name: "User";
  objects: {
    accounts: $AccountPayload<ExtArgs>[];
    sessions: $SessionPayload<ExtArgs>[];
  };
  scalars: runtime.Types.Extensions.GetPayloadResult<{
    id: string;
    email: string;
    emailVerified: boolean;
    name: string | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    username: string | null;
    displayUsername: string | null;
    displayName: string | null;
  }, ExtArgs["result"]["user"]>;
  composites: {};
};
type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = runtime.Types.Result.GetResult<$UserPayload, S>;
type UserCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
  select?: UserCountAggregateInputType | true;
};
interface UserDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
  [K: symbol]: {
    types: TypeMap<ExtArgs>['model']['User'];
    meta: {
      name: 'User';
    };
  };
  /**
   * Find zero or one User that matches the filter.
   * @param {UserFindUniqueArgs} args - Arguments to find a User
   * @example
   * // Get one User
   * const user = await prisma.user.findUnique({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
  /**
   * Find one User that matches the filter or throw an error with `error.code='P2025'`
   * if no matches were found.
   * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
   * @example
   * // Get one User
   * const user = await prisma.user.findUniqueOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Find the first User that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserFindFirstArgs} args - Arguments to find a User
   * @example
   * // Get one User
   * const user = await prisma.user.findFirst({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
  /**
   * Find the first User that matches the filter or
   * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
   * @example
   * // Get one User
   * const user = await prisma.user.findFirstOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Find zero or more Users that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Users
   * const users = await prisma.user.findMany()
   *
   * // Get first 10 Users
   * const users = await prisma.user.findMany({ take: 10 })
   *
   * // Only select the `id`
   * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
   *
   */
  findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
  /**
   * Create a User.
   * @param {UserCreateArgs} args - Arguments to create a User.
   * @example
   * // Create one User
   * const User = await prisma.user.create({
   *   data: {
   *     // ... data to create a User
   *   }
   * })
   *
   */
  create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Create many Users.
   * @param {UserCreateManyArgs} args - Arguments to create many Users.
   * @example
   * // Create many Users
   * const user = await prisma.user.createMany({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   */
  createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Create many Users and returns the data saved in the database.
   * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
   * @example
   * // Create many Users
   * const user = await prisma.user.createManyAndReturn({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   * // Create many Users and only return the `id`
   * const userWithIdOnly = await prisma.user.createManyAndReturn({
   *   select: { id: true },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   *
   */
  createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
  /**
   * Delete a User.
   * @param {UserDeleteArgs} args - Arguments to delete one User.
   * @example
   * // Delete one User
   * const User = await prisma.user.delete({
   *   where: {
   *     // ... filter to delete one User
   *   }
   * })
   *
   */
  delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Update one User.
   * @param {UserUpdateArgs} args - Arguments to update one User.
   * @example
   * // Update one User
   * const user = await prisma.user.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   *
   */
  update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Delete zero or more Users.
   * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
   * @example
   * // Delete a few Users
   * const { count } = await prisma.user.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   *
   */
  deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Update zero or more Users.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Users
   * const user = await prisma.user.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   *
   */
  updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Update zero or more Users and returns the data updated in the database.
   * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
   * @example
   * // Update many Users
   * const user = await prisma.user.updateManyAndReturn({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   * // Update zero or more Users and only return the `id`
   * const userWithIdOnly = await prisma.user.updateManyAndReturn({
   *   select: { id: true },
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   *
   */
  updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
  /**
   * Create or update one User.
   * @param {UserUpsertArgs} args - Arguments to update or create a User.
   * @example
   * // Update or create a User
   * const user = await prisma.user.upsert({
   *   create: {
   *     // ... data to create a User
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the User we want to update
   *   }
   * })
   */
  upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Count the number of Users.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserCountArgs} args - Arguments to filter Users to count.
   * @example
   * // Count the number of Users
   * const count = await prisma.user.count({
   *   where: {
   *     // ... the filter for the Users we want to count
   *   }
   * })
  **/
  count<T extends UserCountArgs>(args?: Subset<T, UserCountArgs>): PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : GetScalarType<T['select'], UserCountAggregateOutputType> : number>;
  /**
   * Allows you to perform aggregations operations on a User.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
   * @example
   * // Ordered by age ascending
   * // Where email contains prisma.io
   * // Limited to the 10 users
   * const aggregations = await prisma.user.aggregate({
   *   _avg: {
   *     age: true,
   *   },
   *   where: {
   *     email: {
   *       contains: "prisma.io",
   *     },
   *   },
   *   orderBy: {
   *     age: "asc",
   *   },
   *   take: 10,
   * })
  **/
  aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): PrismaPromise<GetUserAggregateType<T>>;
  /**
   * Group by User.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserGroupByArgs} args - Group by arguments.
   * @example
   * // Group by city, order by createdAt, get count
   * const result = await prisma.user.groupBy({
   *   by: ['city', 'createdAt'],
   *   orderBy: {
   *     createdAt: true
   *   },
   *   _count: {
   *     _all: true
   *   },
   * })
   *
  **/
  groupBy<T extends UserGroupByArgs, HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>, OrderByArg extends (True extends HasSelectOrTake ? {
    orderBy: UserGroupByArgs['orderBy'];
  } : {
    orderBy?: UserGroupByArgs['orderBy'];
  }), OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>, ByFields extends MaybeTupleToUnion<T['by']>, ByValid extends Has<ByFields, OrderFields>, HavingFields extends GetHavingFields<T['having']>, HavingValid extends Has<ByFields, HavingFields>, ByEmpty extends (T['by'] extends never[] ? True : False), InputErrors extends (ByEmpty extends True ? `Error: "by" must not be empty.` : HavingValid extends False ? { [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`] }[HavingFields] : 'take' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields])>(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : PrismaPromise<InputErrors>;
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for User.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
interface Prisma__UserClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends PrismaPromise<T> {
  readonly [Symbol.toStringTag]: "PrismaPromise";
  accounts<T extends User$accountsArgs<ExtArgs> = {}>(args?: Subset<T, User$accountsArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
  sessions<T extends User$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$sessionsArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the User model
 */
interface UserFieldRefs {
  readonly id: FieldRef<"User", 'String'>;
  readonly email: FieldRef<"User", 'String'>;
  readonly emailVerified: FieldRef<"User", 'Boolean'>;
  readonly name: FieldRef<"User", 'String'>;
  readonly image: FieldRef<"User", 'String'>;
  readonly createdAt: FieldRef<"User", 'DateTime'>;
  readonly updatedAt: FieldRef<"User", 'DateTime'>;
  readonly username: FieldRef<"User", 'String'>;
  readonly displayUsername: FieldRef<"User", 'String'>;
  readonly displayName: FieldRef<"User", 'String'>;
}
/**
 * User findUnique
 */
type UserFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: UserInclude<ExtArgs> | null;
  /**
   * Filter, which User to fetch.
   */
  where: UserWhereUniqueInput;
};
/**
 * User findUniqueOrThrow
 */
type UserFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: UserInclude<ExtArgs> | null;
  /**
   * Filter, which User to fetch.
   */
  where: UserWhereUniqueInput;
};
/**
 * User findFirst
 */
type UserFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: UserInclude<ExtArgs> | null;
  /**
   * Filter, which User to fetch.
   */
  where?: UserWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Users to fetch.
   */
  orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for searching for Users.
   */
  cursor?: UserWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Users from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Users.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Users.
   */
  distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
};
/**
 * User findFirstOrThrow
 */
type UserFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: UserInclude<ExtArgs> | null;
  /**
   * Filter, which User to fetch.
   */
  where?: UserWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Users to fetch.
   */
  orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for searching for Users.
   */
  cursor?: UserWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Users from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Users.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Users.
   */
  distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
};
/**
 * User findMany
 */
type UserFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: UserInclude<ExtArgs> | null;
  /**
   * Filter, which Users to fetch.
   */
  where?: UserWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Users to fetch.
   */
  orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for listing Users.
   */
  cursor?: UserWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Users from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Users.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Users.
   */
  distinct?: UserScalarFieldEnum | UserScalarFieldEnum[];
};
/**
 * User create
 */
type UserCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: UserInclude<ExtArgs> | null;
  /**
   * The data needed to create a User.
   */
  data: XOR<UserCreateInput, UserUncheckedCreateInput>;
};
/**
 * User createMany
 */
type UserCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to create many Users.
   */
  data: UserCreateManyInput | UserCreateManyInput[];
  skipDuplicates?: boolean;
};
/**
 * User createManyAndReturn
 */
type UserCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelectCreateManyAndReturn<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * The data used to create many Users.
   */
  data: UserCreateManyInput | UserCreateManyInput[];
  skipDuplicates?: boolean;
};
/**
 * User update
 */
type UserUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: UserInclude<ExtArgs> | null;
  /**
   * The data needed to update a User.
   */
  data: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
  /**
   * Choose, which User to update.
   */
  where: UserWhereUniqueInput;
};
/**
 * User updateMany
 */
type UserUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to update Users.
   */
  data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
  /**
   * Filter which Users to update
   */
  where?: UserWhereInput;
  /**
   * Limit how many Users to update.
   */
  limit?: number;
};
/**
 * User updateManyAndReturn
 */
type UserUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelectUpdateManyAndReturn<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * The data used to update Users.
   */
  data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>;
  /**
   * Filter which Users to update
   */
  where?: UserWhereInput;
  /**
   * Limit how many Users to update.
   */
  limit?: number;
};
/**
 * User upsert
 */
type UserUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: UserInclude<ExtArgs> | null;
  /**
   * The filter to search for the User to update in case it exists.
   */
  where: UserWhereUniqueInput;
  /**
   * In case the User found by the `where` argument doesn't exist, create a new User with this data.
   */
  create: XOR<UserCreateInput, UserUncheckedCreateInput>;
  /**
   * In case the User was found with the provided `where` argument, update it with this data.
   */
  update: XOR<UserUpdateInput, UserUncheckedUpdateInput>;
};
/**
 * User delete
 */
type UserDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: UserInclude<ExtArgs> | null;
  /**
   * Filter which User to delete.
   */
  where: UserWhereUniqueInput;
};
/**
 * User deleteMany
 */
type UserDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Users to delete
   */
  where?: UserWhereInput;
  /**
   * Limit how many Users to delete.
   */
  limit?: number;
};
/**
 * User.accounts
 */
type User$accountsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
  where?: AccountWhereInput;
  orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[];
  cursor?: AccountWhereUniqueInput;
  take?: number;
  skip?: number;
  distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[];
};
/**
 * User.sessions
 */
type User$sessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
  where?: SessionWhereInput;
  orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[];
  cursor?: SessionWhereUniqueInput;
  take?: number;
  skip?: number;
  distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[];
};
/**
 * User without action
 */
type UserDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: UserSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the User
   */
  omit?: UserOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: UserInclude<ExtArgs> | null;
};
//#endregion
//#region src/generated/prisma/models/Session.d.ts
/**
 * Model Session
 *
 */
type SessionModel = runtime.Types.Result.DefaultSelection<$SessionPayload>;
type AggregateSession = {
  _count: SessionCountAggregateOutputType | null;
  _min: SessionMinAggregateOutputType | null;
  _max: SessionMaxAggregateOutputType | null;
};
type SessionMinAggregateOutputType = {
  id: string | null;
  expiresAt: Date | null;
  token: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string | null;
};
type SessionMaxAggregateOutputType = {
  id: string | null;
  expiresAt: Date | null;
  token: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string | null;
};
type SessionCountAggregateOutputType = {
  id: number;
  expiresAt: number;
  token: number;
  createdAt: number;
  updatedAt: number;
  ipAddress: number;
  userAgent: number;
  userId: number;
  _all: number;
};
type SessionMinAggregateInputType = {
  id?: true;
  expiresAt?: true;
  token?: true;
  createdAt?: true;
  updatedAt?: true;
  ipAddress?: true;
  userAgent?: true;
  userId?: true;
};
type SessionMaxAggregateInputType = {
  id?: true;
  expiresAt?: true;
  token?: true;
  createdAt?: true;
  updatedAt?: true;
  ipAddress?: true;
  userAgent?: true;
  userId?: true;
};
type SessionCountAggregateInputType = {
  id?: true;
  expiresAt?: true;
  token?: true;
  createdAt?: true;
  updatedAt?: true;
  ipAddress?: true;
  userAgent?: true;
  userId?: true;
  _all?: true;
};
type SessionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Session to aggregate.
   */
  where?: SessionWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Sessions to fetch.
   */
  orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the start position
   */
  cursor?: SessionWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Sessions from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Sessions.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Count returned Sessions
  **/
  _count?: true | SessionCountAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to find the minimum value
  **/
  _min?: SessionMinAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to find the maximum value
  **/
  _max?: SessionMaxAggregateInputType;
};
type GetSessionAggregateType<T extends SessionAggregateArgs> = { [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count' ? T[P] extends true ? number : GetScalarType<T[P], AggregateSession[P]> : GetScalarType<T[P], AggregateSession[P]> };
type SessionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: SessionWhereInput;
  orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[];
  by: SessionScalarFieldEnum[] | SessionScalarFieldEnum;
  having?: SessionScalarWhereWithAggregatesInput;
  take?: number;
  skip?: number;
  _count?: SessionCountAggregateInputType | true;
  _min?: SessionMinAggregateInputType;
  _max?: SessionMaxAggregateInputType;
};
type SessionGroupByOutputType = {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  _count: SessionCountAggregateOutputType | null;
  _min: SessionMinAggregateOutputType | null;
  _max: SessionMaxAggregateOutputType | null;
};
type GetSessionGroupByPayload<T extends SessionGroupByArgs> = PrismaPromise<Array<PickEnumerable<SessionGroupByOutputType, T['by']> & { [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : GetScalarType<T[P], SessionGroupByOutputType[P]> : GetScalarType<T[P], SessionGroupByOutputType[P]> }>>;
type SessionWhereInput = {
  AND?: SessionWhereInput | SessionWhereInput[];
  OR?: SessionWhereInput[];
  NOT?: SessionWhereInput | SessionWhereInput[];
  id?: StringFilter<"Session"> | string;
  expiresAt?: DateTimeFilter<"Session"> | Date | string;
  token?: StringFilter<"Session"> | string;
  createdAt?: DateTimeFilter<"Session"> | Date | string;
  updatedAt?: DateTimeFilter<"Session"> | Date | string;
  ipAddress?: StringNullableFilter<"Session"> | string | null;
  userAgent?: StringNullableFilter<"Session"> | string | null;
  userId?: StringFilter<"Session"> | string;
  user?: XOR<UserScalarRelationFilter, UserWhereInput>;
};
type SessionOrderByWithRelationInput = {
  id?: SortOrder;
  expiresAt?: SortOrder;
  token?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  ipAddress?: SortOrderInput | SortOrder;
  userAgent?: SortOrderInput | SortOrder;
  userId?: SortOrder;
  user?: UserOrderByWithRelationInput;
};
type SessionWhereUniqueInput = AtLeast<{
  id?: string;
  token?: string;
  AND?: SessionWhereInput | SessionWhereInput[];
  OR?: SessionWhereInput[];
  NOT?: SessionWhereInput | SessionWhereInput[];
  expiresAt?: DateTimeFilter<"Session"> | Date | string;
  createdAt?: DateTimeFilter<"Session"> | Date | string;
  updatedAt?: DateTimeFilter<"Session"> | Date | string;
  ipAddress?: StringNullableFilter<"Session"> | string | null;
  userAgent?: StringNullableFilter<"Session"> | string | null;
  userId?: StringFilter<"Session"> | string;
  user?: XOR<UserScalarRelationFilter, UserWhereInput>;
}, "id" | "token">;
type SessionOrderByWithAggregationInput = {
  id?: SortOrder;
  expiresAt?: SortOrder;
  token?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  ipAddress?: SortOrderInput | SortOrder;
  userAgent?: SortOrderInput | SortOrder;
  userId?: SortOrder;
  _count?: SessionCountOrderByAggregateInput;
  _max?: SessionMaxOrderByAggregateInput;
  _min?: SessionMinOrderByAggregateInput;
};
type SessionScalarWhereWithAggregatesInput = {
  AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[];
  OR?: SessionScalarWhereWithAggregatesInput[];
  NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[];
  id?: StringWithAggregatesFilter<"Session"> | string;
  expiresAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string;
  token?: StringWithAggregatesFilter<"Session"> | string;
  createdAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string;
  updatedAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string;
  ipAddress?: StringNullableWithAggregatesFilter<"Session"> | string | null;
  userAgent?: StringNullableWithAggregatesFilter<"Session"> | string | null;
  userId?: StringWithAggregatesFilter<"Session"> | string;
};
type SessionCreateInput = {
  id?: string;
  expiresAt: Date | string;
  token: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
  user: UserCreateNestedOneWithoutSessionsInput;
};
type SessionUncheckedCreateInput = {
  id?: string;
  expiresAt: Date | string;
  token: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
};
type SessionUpdateInput = {
  id?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  token?: StringFieldUpdateOperationsInput | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
  userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
  user?: UserUpdateOneRequiredWithoutSessionsNestedInput;
};
type SessionUncheckedUpdateInput = {
  id?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  token?: StringFieldUpdateOperationsInput | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
  userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
  userId?: StringFieldUpdateOperationsInput | string;
};
type SessionCreateManyInput = {
  id?: string;
  expiresAt: Date | string;
  token: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
};
type SessionUpdateManyMutationInput = {
  id?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  token?: StringFieldUpdateOperationsInput | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
  userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
};
type SessionUncheckedUpdateManyInput = {
  id?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  token?: StringFieldUpdateOperationsInput | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
  userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
  userId?: StringFieldUpdateOperationsInput | string;
};
type SessionListRelationFilter = {
  every?: SessionWhereInput;
  some?: SessionWhereInput;
  none?: SessionWhereInput;
};
type SessionOrderByRelationAggregateInput = {
  _count?: SortOrder;
};
type SessionCountOrderByAggregateInput = {
  id?: SortOrder;
  expiresAt?: SortOrder;
  token?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  ipAddress?: SortOrder;
  userAgent?: SortOrder;
  userId?: SortOrder;
};
type SessionMaxOrderByAggregateInput = {
  id?: SortOrder;
  expiresAt?: SortOrder;
  token?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  ipAddress?: SortOrder;
  userAgent?: SortOrder;
  userId?: SortOrder;
};
type SessionMinOrderByAggregateInput = {
  id?: SortOrder;
  expiresAt?: SortOrder;
  token?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  ipAddress?: SortOrder;
  userAgent?: SortOrder;
  userId?: SortOrder;
};
type SessionCreateNestedManyWithoutUserInput = {
  create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[];
  connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[];
  createMany?: SessionCreateManyUserInputEnvelope;
  connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
};
type SessionUncheckedCreateNestedManyWithoutUserInput = {
  create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[];
  connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[];
  createMany?: SessionCreateManyUserInputEnvelope;
  connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
};
type SessionUpdateManyWithoutUserNestedInput = {
  create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[];
  connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[];
  upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[];
  createMany?: SessionCreateManyUserInputEnvelope;
  set?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
  disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
  delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
  connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
  update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[];
  updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[];
  deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[];
};
type SessionUncheckedUpdateManyWithoutUserNestedInput = {
  create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[];
  connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[];
  upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[];
  createMany?: SessionCreateManyUserInputEnvelope;
  set?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
  disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
  delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
  connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[];
  update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[];
  updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[];
  deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[];
};
type SessionCreateWithoutUserInput = {
  id?: string;
  expiresAt: Date | string;
  token: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
};
type SessionUncheckedCreateWithoutUserInput = {
  id?: string;
  expiresAt: Date | string;
  token: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
};
type SessionCreateOrConnectWithoutUserInput = {
  where: SessionWhereUniqueInput;
  create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>;
};
type SessionCreateManyUserInputEnvelope = {
  data: SessionCreateManyUserInput | SessionCreateManyUserInput[];
  skipDuplicates?: boolean;
};
type SessionUpsertWithWhereUniqueWithoutUserInput = {
  where: SessionWhereUniqueInput;
  update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>;
  create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>;
};
type SessionUpdateWithWhereUniqueWithoutUserInput = {
  where: SessionWhereUniqueInput;
  data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>;
};
type SessionUpdateManyWithWhereWithoutUserInput = {
  where: SessionScalarWhereInput;
  data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>;
};
type SessionScalarWhereInput = {
  AND?: SessionScalarWhereInput | SessionScalarWhereInput[];
  OR?: SessionScalarWhereInput[];
  NOT?: SessionScalarWhereInput | SessionScalarWhereInput[];
  id?: StringFilter<"Session"> | string;
  expiresAt?: DateTimeFilter<"Session"> | Date | string;
  token?: StringFilter<"Session"> | string;
  createdAt?: DateTimeFilter<"Session"> | Date | string;
  updatedAt?: DateTimeFilter<"Session"> | Date | string;
  ipAddress?: StringNullableFilter<"Session"> | string | null;
  userAgent?: StringNullableFilter<"Session"> | string | null;
  userId?: StringFilter<"Session"> | string;
};
type SessionCreateManyUserInput = {
  id?: string;
  expiresAt: Date | string;
  token: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
};
type SessionUpdateWithoutUserInput = {
  id?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  token?: StringFieldUpdateOperationsInput | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
  userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
};
type SessionUncheckedUpdateWithoutUserInput = {
  id?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  token?: StringFieldUpdateOperationsInput | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
  userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
};
type SessionUncheckedUpdateManyWithoutUserInput = {
  id?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  token?: StringFieldUpdateOperationsInput | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  ipAddress?: NullableStringFieldUpdateOperationsInput | string | null;
  userAgent?: NullableStringFieldUpdateOperationsInput | string | null;
};
type SessionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  expiresAt?: boolean;
  token?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  ipAddress?: boolean;
  userAgent?: boolean;
  userId?: boolean;
  user?: boolean | UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["session"]>;
type SessionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  expiresAt?: boolean;
  token?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  ipAddress?: boolean;
  userAgent?: boolean;
  userId?: boolean;
  user?: boolean | UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["session"]>;
type SessionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  expiresAt?: boolean;
  token?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  ipAddress?: boolean;
  userAgent?: boolean;
  userId?: boolean;
  user?: boolean | UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["session"]>;
type SessionSelectScalar = {
  id?: boolean;
  expiresAt?: boolean;
  token?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  ipAddress?: boolean;
  userAgent?: boolean;
  userId?: boolean;
};
type SessionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "expiresAt" | "token" | "createdAt" | "updatedAt" | "ipAddress" | "userAgent" | "userId", ExtArgs["result"]["session"]>;
type SessionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | UserDefaultArgs<ExtArgs>;
};
type SessionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | UserDefaultArgs<ExtArgs>;
};
type SessionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | UserDefaultArgs<ExtArgs>;
};
type $SessionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  name: "Session";
  objects: {
    user: $UserPayload<ExtArgs>;
  };
  scalars: runtime.Types.Extensions.GetPayloadResult<{
    id: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
  }, ExtArgs["result"]["session"]>;
  composites: {};
};
type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = runtime.Types.Result.GetResult<$SessionPayload, S>;
type SessionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
  select?: SessionCountAggregateInputType | true;
};
interface SessionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
  [K: symbol]: {
    types: TypeMap<ExtArgs>['model']['Session'];
    meta: {
      name: 'Session';
    };
  };
  /**
   * Find zero or one Session that matches the filter.
   * @param {SessionFindUniqueArgs} args - Arguments to find a Session
   * @example
   * // Get one Session
   * const session = await prisma.session.findUnique({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
  /**
   * Find one Session that matches the filter or throw an error with `error.code='P2025'`
   * if no matches were found.
   * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
   * @example
   * // Get one Session
   * const session = await prisma.session.findUniqueOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Find the first Session that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionFindFirstArgs} args - Arguments to find a Session
   * @example
   * // Get one Session
   * const session = await prisma.session.findFirst({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
  /**
   * Find the first Session that matches the filter or
   * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
   * @example
   * // Get one Session
   * const session = await prisma.session.findFirstOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Find zero or more Sessions that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Sessions
   * const sessions = await prisma.session.findMany()
   *
   * // Get first 10 Sessions
   * const sessions = await prisma.session.findMany({ take: 10 })
   *
   * // Only select the `id`
   * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
   *
   */
  findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
  /**
   * Create a Session.
   * @param {SessionCreateArgs} args - Arguments to create a Session.
   * @example
   * // Create one Session
   * const Session = await prisma.session.create({
   *   data: {
   *     // ... data to create a Session
   *   }
   * })
   *
   */
  create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Create many Sessions.
   * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
   * @example
   * // Create many Sessions
   * const session = await prisma.session.createMany({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   */
  createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Create many Sessions and returns the data saved in the database.
   * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
   * @example
   * // Create many Sessions
   * const session = await prisma.session.createManyAndReturn({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   * // Create many Sessions and only return the `id`
   * const sessionWithIdOnly = await prisma.session.createManyAndReturn({
   *   select: { id: true },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   *
   */
  createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
  /**
   * Delete a Session.
   * @param {SessionDeleteArgs} args - Arguments to delete one Session.
   * @example
   * // Delete one Session
   * const Session = await prisma.session.delete({
   *   where: {
   *     // ... filter to delete one Session
   *   }
   * })
   *
   */
  delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Update one Session.
   * @param {SessionUpdateArgs} args - Arguments to update one Session.
   * @example
   * // Update one Session
   * const session = await prisma.session.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   *
   */
  update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Delete zero or more Sessions.
   * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
   * @example
   * // Delete a few Sessions
   * const { count } = await prisma.session.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   *
   */
  deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Update zero or more Sessions.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Sessions
   * const session = await prisma.session.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   *
   */
  updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Update zero or more Sessions and returns the data updated in the database.
   * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
   * @example
   * // Update many Sessions
   * const session = await prisma.session.updateManyAndReturn({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   * // Update zero or more Sessions and only return the `id`
   * const sessionWithIdOnly = await prisma.session.updateManyAndReturn({
   *   select: { id: true },
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   *
   */
  updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
  /**
   * Create or update one Session.
   * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
   * @example
   * // Update or create a Session
   * const session = await prisma.session.upsert({
   *   create: {
   *     // ... data to create a Session
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Session we want to update
   *   }
   * })
   */
  upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<runtime.Types.Result.GetResult<$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Count the number of Sessions.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
   * @example
   * // Count the number of Sessions
   * const count = await prisma.session.count({
   *   where: {
   *     // ... the filter for the Sessions we want to count
   *   }
   * })
  **/
  count<T extends SessionCountArgs>(args?: Subset<T, SessionCountArgs>): PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : GetScalarType<T['select'], SessionCountAggregateOutputType> : number>;
  /**
   * Allows you to perform aggregations operations on a Session.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
   * @example
   * // Ordered by age ascending
   * // Where email contains prisma.io
   * // Limited to the 10 users
   * const aggregations = await prisma.user.aggregate({
   *   _avg: {
   *     age: true,
   *   },
   *   where: {
   *     email: {
   *       contains: "prisma.io",
   *     },
   *   },
   *   orderBy: {
   *     age: "asc",
   *   },
   *   take: 10,
   * })
  **/
  aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): PrismaPromise<GetSessionAggregateType<T>>;
  /**
   * Group by Session.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionGroupByArgs} args - Group by arguments.
   * @example
   * // Group by city, order by createdAt, get count
   * const result = await prisma.user.groupBy({
   *   by: ['city', 'createdAt'],
   *   orderBy: {
   *     createdAt: true
   *   },
   *   _count: {
   *     _all: true
   *   },
   * })
   *
  **/
  groupBy<T extends SessionGroupByArgs, HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>, OrderByArg extends (True extends HasSelectOrTake ? {
    orderBy: SessionGroupByArgs['orderBy'];
  } : {
    orderBy?: SessionGroupByArgs['orderBy'];
  }), OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>, ByFields extends MaybeTupleToUnion<T['by']>, ByValid extends Has<ByFields, OrderFields>, HavingFields extends GetHavingFields<T['having']>, HavingValid extends Has<ByFields, HavingFields>, ByEmpty extends (T['by'] extends never[] ? True : False), InputErrors extends (ByEmpty extends True ? `Error: "by" must not be empty.` : HavingValid extends False ? { [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`] }[HavingFields] : 'take' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields])>(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : PrismaPromise<InputErrors>;
  /**
   * Fields of the Session model
   */
  readonly fields: SessionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Session.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
interface Prisma__SessionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends PrismaPromise<T> {
  readonly [Symbol.toStringTag]: "PrismaPromise";
  user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Session model
 */
interface SessionFieldRefs {
  readonly id: FieldRef<"Session", 'String'>;
  readonly expiresAt: FieldRef<"Session", 'DateTime'>;
  readonly token: FieldRef<"Session", 'String'>;
  readonly createdAt: FieldRef<"Session", 'DateTime'>;
  readonly updatedAt: FieldRef<"Session", 'DateTime'>;
  readonly ipAddress: FieldRef<"Session", 'String'>;
  readonly userAgent: FieldRef<"Session", 'String'>;
  readonly userId: FieldRef<"Session", 'String'>;
}
/**
 * Session findUnique
 */
type SessionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
  /**
   * Filter, which Session to fetch.
   */
  where: SessionWhereUniqueInput;
};
/**
 * Session findUniqueOrThrow
 */
type SessionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
  /**
   * Filter, which Session to fetch.
   */
  where: SessionWhereUniqueInput;
};
/**
 * Session findFirst
 */
type SessionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
  /**
   * Filter, which Session to fetch.
   */
  where?: SessionWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Sessions to fetch.
   */
  orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for searching for Sessions.
   */
  cursor?: SessionWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Sessions from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Sessions.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Sessions.
   */
  distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[];
};
/**
 * Session findFirstOrThrow
 */
type SessionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
  /**
   * Filter, which Session to fetch.
   */
  where?: SessionWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Sessions to fetch.
   */
  orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for searching for Sessions.
   */
  cursor?: SessionWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Sessions from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Sessions.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Sessions.
   */
  distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[];
};
/**
 * Session findMany
 */
type SessionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
  /**
   * Filter, which Sessions to fetch.
   */
  where?: SessionWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Sessions to fetch.
   */
  orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for listing Sessions.
   */
  cursor?: SessionWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Sessions from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Sessions.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Sessions.
   */
  distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[];
};
/**
 * Session create
 */
type SessionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
  /**
   * The data needed to create a Session.
   */
  data: XOR<SessionCreateInput, SessionUncheckedCreateInput>;
};
/**
 * Session createMany
 */
type SessionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to create many Sessions.
   */
  data: SessionCreateManyInput | SessionCreateManyInput[];
  skipDuplicates?: boolean;
};
/**
 * Session createManyAndReturn
 */
type SessionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelectCreateManyAndReturn<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * The data used to create many Sessions.
   */
  data: SessionCreateManyInput | SessionCreateManyInput[];
  skipDuplicates?: boolean;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Session update
 */
type SessionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
  /**
   * The data needed to update a Session.
   */
  data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>;
  /**
   * Choose, which Session to update.
   */
  where: SessionWhereUniqueInput;
};
/**
 * Session updateMany
 */
type SessionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to update Sessions.
   */
  data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>;
  /**
   * Filter which Sessions to update
   */
  where?: SessionWhereInput;
  /**
   * Limit how many Sessions to update.
   */
  limit?: number;
};
/**
 * Session updateManyAndReturn
 */
type SessionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * The data used to update Sessions.
   */
  data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>;
  /**
   * Filter which Sessions to update
   */
  where?: SessionWhereInput;
  /**
   * Limit how many Sessions to update.
   */
  limit?: number;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Session upsert
 */
type SessionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
  /**
   * The filter to search for the Session to update in case it exists.
   */
  where: SessionWhereUniqueInput;
  /**
   * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
   */
  create: XOR<SessionCreateInput, SessionUncheckedCreateInput>;
  /**
   * In case the Session was found with the provided `where` argument, update it with this data.
   */
  update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>;
};
/**
 * Session delete
 */
type SessionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
  /**
   * Filter which Session to delete.
   */
  where: SessionWhereUniqueInput;
};
/**
 * Session deleteMany
 */
type SessionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Sessions to delete
   */
  where?: SessionWhereInput;
  /**
   * Limit how many Sessions to delete.
   */
  limit?: number;
};
/**
 * Session without action
 */
type SessionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: SessionSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Session
   */
  omit?: SessionOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: SessionInclude<ExtArgs> | null;
};
//#endregion
//#region src/generated/prisma/models/Account.d.ts
/**
 * Model Account
 *
 */
type AccountModel = runtime.Types.Result.DefaultSelection<$AccountPayload>;
type AggregateAccount = {
  _count: AccountCountAggregateOutputType | null;
  _min: AccountMinAggregateOutputType | null;
  _max: AccountMaxAggregateOutputType | null;
};
type AccountMinAggregateOutputType = {
  id: string | null;
  accountId: string | null;
  providerId: string | null;
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
type AccountMaxAggregateOutputType = {
  id: string | null;
  accountId: string | null;
  providerId: string | null;
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
type AccountCountAggregateOutputType = {
  id: number;
  accountId: number;
  providerId: number;
  userId: number;
  accessToken: number;
  refreshToken: number;
  idToken: number;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  scope: number;
  password: number;
  createdAt: number;
  updatedAt: number;
  _all: number;
};
type AccountMinAggregateInputType = {
  id?: true;
  accountId?: true;
  providerId?: true;
  userId?: true;
  accessToken?: true;
  refreshToken?: true;
  idToken?: true;
  accessTokenExpiresAt?: true;
  refreshTokenExpiresAt?: true;
  scope?: true;
  password?: true;
  createdAt?: true;
  updatedAt?: true;
};
type AccountMaxAggregateInputType = {
  id?: true;
  accountId?: true;
  providerId?: true;
  userId?: true;
  accessToken?: true;
  refreshToken?: true;
  idToken?: true;
  accessTokenExpiresAt?: true;
  refreshTokenExpiresAt?: true;
  scope?: true;
  password?: true;
  createdAt?: true;
  updatedAt?: true;
};
type AccountCountAggregateInputType = {
  id?: true;
  accountId?: true;
  providerId?: true;
  userId?: true;
  accessToken?: true;
  refreshToken?: true;
  idToken?: true;
  accessTokenExpiresAt?: true;
  refreshTokenExpiresAt?: true;
  scope?: true;
  password?: true;
  createdAt?: true;
  updatedAt?: true;
  _all?: true;
};
type AccountAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Account to aggregate.
   */
  where?: AccountWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Accounts to fetch.
   */
  orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the start position
   */
  cursor?: AccountWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Accounts from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Accounts.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Count returned Accounts
  **/
  _count?: true | AccountCountAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to find the minimum value
  **/
  _min?: AccountMinAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to find the maximum value
  **/
  _max?: AccountMaxAggregateInputType;
};
type GetAccountAggregateType<T extends AccountAggregateArgs> = { [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count' ? T[P] extends true ? number : GetScalarType<T[P], AggregateAccount[P]> : GetScalarType<T[P], AggregateAccount[P]> };
type AccountGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: AccountWhereInput;
  orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[];
  by: AccountScalarFieldEnum[] | AccountScalarFieldEnum;
  having?: AccountScalarWhereWithAggregatesInput;
  take?: number;
  skip?: number;
  _count?: AccountCountAggregateInputType | true;
  _min?: AccountMinAggregateInputType;
  _max?: AccountMaxAggregateInputType;
};
type AccountGroupByOutputType = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: AccountCountAggregateOutputType | null;
  _min: AccountMinAggregateOutputType | null;
  _max: AccountMaxAggregateOutputType | null;
};
type GetAccountGroupByPayload<T extends AccountGroupByArgs> = PrismaPromise<Array<PickEnumerable<AccountGroupByOutputType, T['by']> & { [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : GetScalarType<T[P], AccountGroupByOutputType[P]> : GetScalarType<T[P], AccountGroupByOutputType[P]> }>>;
type AccountWhereInput = {
  AND?: AccountWhereInput | AccountWhereInput[];
  OR?: AccountWhereInput[];
  NOT?: AccountWhereInput | AccountWhereInput[];
  id?: StringFilter<"Account"> | string;
  accountId?: StringFilter<"Account"> | string;
  providerId?: StringFilter<"Account"> | string;
  userId?: StringFilter<"Account"> | string;
  accessToken?: StringNullableFilter<"Account"> | string | null;
  refreshToken?: StringNullableFilter<"Account"> | string | null;
  idToken?: StringNullableFilter<"Account"> | string | null;
  accessTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null;
  refreshTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null;
  scope?: StringNullableFilter<"Account"> | string | null;
  password?: StringNullableFilter<"Account"> | string | null;
  createdAt?: DateTimeFilter<"Account"> | Date | string;
  updatedAt?: DateTimeFilter<"Account"> | Date | string;
  user?: XOR<UserScalarRelationFilter, UserWhereInput>;
};
type AccountOrderByWithRelationInput = {
  id?: SortOrder;
  accountId?: SortOrder;
  providerId?: SortOrder;
  userId?: SortOrder;
  accessToken?: SortOrderInput | SortOrder;
  refreshToken?: SortOrderInput | SortOrder;
  idToken?: SortOrderInput | SortOrder;
  accessTokenExpiresAt?: SortOrderInput | SortOrder;
  refreshTokenExpiresAt?: SortOrderInput | SortOrder;
  scope?: SortOrderInput | SortOrder;
  password?: SortOrderInput | SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  user?: UserOrderByWithRelationInput;
};
type AccountWhereUniqueInput = AtLeast<{
  id?: string;
  providerId_accountId?: AccountProviderIdAccountIdCompoundUniqueInput;
  AND?: AccountWhereInput | AccountWhereInput[];
  OR?: AccountWhereInput[];
  NOT?: AccountWhereInput | AccountWhereInput[];
  accountId?: StringFilter<"Account"> | string;
  providerId?: StringFilter<"Account"> | string;
  userId?: StringFilter<"Account"> | string;
  accessToken?: StringNullableFilter<"Account"> | string | null;
  refreshToken?: StringNullableFilter<"Account"> | string | null;
  idToken?: StringNullableFilter<"Account"> | string | null;
  accessTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null;
  refreshTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null;
  scope?: StringNullableFilter<"Account"> | string | null;
  password?: StringNullableFilter<"Account"> | string | null;
  createdAt?: DateTimeFilter<"Account"> | Date | string;
  updatedAt?: DateTimeFilter<"Account"> | Date | string;
  user?: XOR<UserScalarRelationFilter, UserWhereInput>;
}, "id" | "providerId_accountId">;
type AccountOrderByWithAggregationInput = {
  id?: SortOrder;
  accountId?: SortOrder;
  providerId?: SortOrder;
  userId?: SortOrder;
  accessToken?: SortOrderInput | SortOrder;
  refreshToken?: SortOrderInput | SortOrder;
  idToken?: SortOrderInput | SortOrder;
  accessTokenExpiresAt?: SortOrderInput | SortOrder;
  refreshTokenExpiresAt?: SortOrderInput | SortOrder;
  scope?: SortOrderInput | SortOrder;
  password?: SortOrderInput | SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  _count?: AccountCountOrderByAggregateInput;
  _max?: AccountMaxOrderByAggregateInput;
  _min?: AccountMinOrderByAggregateInput;
};
type AccountScalarWhereWithAggregatesInput = {
  AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[];
  OR?: AccountScalarWhereWithAggregatesInput[];
  NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[];
  id?: StringWithAggregatesFilter<"Account"> | string;
  accountId?: StringWithAggregatesFilter<"Account"> | string;
  providerId?: StringWithAggregatesFilter<"Account"> | string;
  userId?: StringWithAggregatesFilter<"Account"> | string;
  accessToken?: StringNullableWithAggregatesFilter<"Account"> | string | null;
  refreshToken?: StringNullableWithAggregatesFilter<"Account"> | string | null;
  idToken?: StringNullableWithAggregatesFilter<"Account"> | string | null;
  accessTokenExpiresAt?: DateTimeNullableWithAggregatesFilter<"Account"> | Date | string | null;
  refreshTokenExpiresAt?: DateTimeNullableWithAggregatesFilter<"Account"> | Date | string | null;
  scope?: StringNullableWithAggregatesFilter<"Account"> | string | null;
  password?: StringNullableWithAggregatesFilter<"Account"> | string | null;
  createdAt?: DateTimeWithAggregatesFilter<"Account"> | Date | string;
  updatedAt?: DateTimeWithAggregatesFilter<"Account"> | Date | string;
};
type AccountCreateInput = {
  id?: string;
  accountId: string;
  providerId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | string | null;
  refreshTokenExpiresAt?: Date | string | null;
  scope?: string | null;
  password?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  user: UserCreateNestedOneWithoutAccountsInput;
};
type AccountUncheckedCreateInput = {
  id?: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | string | null;
  refreshTokenExpiresAt?: Date | string | null;
  scope?: string | null;
  password?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
type AccountUpdateInput = {
  id?: StringFieldUpdateOperationsInput | string;
  accountId?: StringFieldUpdateOperationsInput | string;
  providerId?: StringFieldUpdateOperationsInput | string;
  accessToken?: NullableStringFieldUpdateOperationsInput | string | null;
  refreshToken?: NullableStringFieldUpdateOperationsInput | string | null;
  idToken?: NullableStringFieldUpdateOperationsInput | string | null;
  accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  scope?: NullableStringFieldUpdateOperationsInput | string | null;
  password?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  user?: UserUpdateOneRequiredWithoutAccountsNestedInput;
};
type AccountUncheckedUpdateInput = {
  id?: StringFieldUpdateOperationsInput | string;
  accountId?: StringFieldUpdateOperationsInput | string;
  providerId?: StringFieldUpdateOperationsInput | string;
  userId?: StringFieldUpdateOperationsInput | string;
  accessToken?: NullableStringFieldUpdateOperationsInput | string | null;
  refreshToken?: NullableStringFieldUpdateOperationsInput | string | null;
  idToken?: NullableStringFieldUpdateOperationsInput | string | null;
  accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  scope?: NullableStringFieldUpdateOperationsInput | string | null;
  password?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
};
type AccountCreateManyInput = {
  id?: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | string | null;
  refreshTokenExpiresAt?: Date | string | null;
  scope?: string | null;
  password?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
type AccountUpdateManyMutationInput = {
  id?: StringFieldUpdateOperationsInput | string;
  accountId?: StringFieldUpdateOperationsInput | string;
  providerId?: StringFieldUpdateOperationsInput | string;
  accessToken?: NullableStringFieldUpdateOperationsInput | string | null;
  refreshToken?: NullableStringFieldUpdateOperationsInput | string | null;
  idToken?: NullableStringFieldUpdateOperationsInput | string | null;
  accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  scope?: NullableStringFieldUpdateOperationsInput | string | null;
  password?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
};
type AccountUncheckedUpdateManyInput = {
  id?: StringFieldUpdateOperationsInput | string;
  accountId?: StringFieldUpdateOperationsInput | string;
  providerId?: StringFieldUpdateOperationsInput | string;
  userId?: StringFieldUpdateOperationsInput | string;
  accessToken?: NullableStringFieldUpdateOperationsInput | string | null;
  refreshToken?: NullableStringFieldUpdateOperationsInput | string | null;
  idToken?: NullableStringFieldUpdateOperationsInput | string | null;
  accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  scope?: NullableStringFieldUpdateOperationsInput | string | null;
  password?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
};
type AccountListRelationFilter = {
  every?: AccountWhereInput;
  some?: AccountWhereInput;
  none?: AccountWhereInput;
};
type AccountOrderByRelationAggregateInput = {
  _count?: SortOrder;
};
type AccountProviderIdAccountIdCompoundUniqueInput = {
  providerId: string;
  accountId: string;
};
type AccountCountOrderByAggregateInput = {
  id?: SortOrder;
  accountId?: SortOrder;
  providerId?: SortOrder;
  userId?: SortOrder;
  accessToken?: SortOrder;
  refreshToken?: SortOrder;
  idToken?: SortOrder;
  accessTokenExpiresAt?: SortOrder;
  refreshTokenExpiresAt?: SortOrder;
  scope?: SortOrder;
  password?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
};
type AccountMaxOrderByAggregateInput = {
  id?: SortOrder;
  accountId?: SortOrder;
  providerId?: SortOrder;
  userId?: SortOrder;
  accessToken?: SortOrder;
  refreshToken?: SortOrder;
  idToken?: SortOrder;
  accessTokenExpiresAt?: SortOrder;
  refreshTokenExpiresAt?: SortOrder;
  scope?: SortOrder;
  password?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
};
type AccountMinOrderByAggregateInput = {
  id?: SortOrder;
  accountId?: SortOrder;
  providerId?: SortOrder;
  userId?: SortOrder;
  accessToken?: SortOrder;
  refreshToken?: SortOrder;
  idToken?: SortOrder;
  accessTokenExpiresAt?: SortOrder;
  refreshTokenExpiresAt?: SortOrder;
  scope?: SortOrder;
  password?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
};
type AccountCreateNestedManyWithoutUserInput = {
  create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[];
  connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[];
  createMany?: AccountCreateManyUserInputEnvelope;
  connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[];
};
type AccountUncheckedCreateNestedManyWithoutUserInput = {
  create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[];
  connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[];
  createMany?: AccountCreateManyUserInputEnvelope;
  connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[];
};
type AccountUpdateManyWithoutUserNestedInput = {
  create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[];
  connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[];
  upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[];
  createMany?: AccountCreateManyUserInputEnvelope;
  set?: AccountWhereUniqueInput | AccountWhereUniqueInput[];
  disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[];
  delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[];
  connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[];
  update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[];
  updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[];
  deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[];
};
type AccountUncheckedUpdateManyWithoutUserNestedInput = {
  create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[];
  connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[];
  upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[];
  createMany?: AccountCreateManyUserInputEnvelope;
  set?: AccountWhereUniqueInput | AccountWhereUniqueInput[];
  disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[];
  delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[];
  connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[];
  update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[];
  updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[];
  deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[];
};
type NullableDateTimeFieldUpdateOperationsInput = {
  set?: Date | string | null;
};
type AccountCreateWithoutUserInput = {
  id?: string;
  accountId: string;
  providerId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | string | null;
  refreshTokenExpiresAt?: Date | string | null;
  scope?: string | null;
  password?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
type AccountUncheckedCreateWithoutUserInput = {
  id?: string;
  accountId: string;
  providerId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | string | null;
  refreshTokenExpiresAt?: Date | string | null;
  scope?: string | null;
  password?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
type AccountCreateOrConnectWithoutUserInput = {
  where: AccountWhereUniqueInput;
  create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>;
};
type AccountCreateManyUserInputEnvelope = {
  data: AccountCreateManyUserInput | AccountCreateManyUserInput[];
  skipDuplicates?: boolean;
};
type AccountUpsertWithWhereUniqueWithoutUserInput = {
  where: AccountWhereUniqueInput;
  update: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>;
  create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>;
};
type AccountUpdateWithWhereUniqueWithoutUserInput = {
  where: AccountWhereUniqueInput;
  data: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>;
};
type AccountUpdateManyWithWhereWithoutUserInput = {
  where: AccountScalarWhereInput;
  data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyWithoutUserInput>;
};
type AccountScalarWhereInput = {
  AND?: AccountScalarWhereInput | AccountScalarWhereInput[];
  OR?: AccountScalarWhereInput[];
  NOT?: AccountScalarWhereInput | AccountScalarWhereInput[];
  id?: StringFilter<"Account"> | string;
  accountId?: StringFilter<"Account"> | string;
  providerId?: StringFilter<"Account"> | string;
  userId?: StringFilter<"Account"> | string;
  accessToken?: StringNullableFilter<"Account"> | string | null;
  refreshToken?: StringNullableFilter<"Account"> | string | null;
  idToken?: StringNullableFilter<"Account"> | string | null;
  accessTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null;
  refreshTokenExpiresAt?: DateTimeNullableFilter<"Account"> | Date | string | null;
  scope?: StringNullableFilter<"Account"> | string | null;
  password?: StringNullableFilter<"Account"> | string | null;
  createdAt?: DateTimeFilter<"Account"> | Date | string;
  updatedAt?: DateTimeFilter<"Account"> | Date | string;
};
type AccountCreateManyUserInput = {
  id?: string;
  accountId: string;
  providerId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | string | null;
  refreshTokenExpiresAt?: Date | string | null;
  scope?: string | null;
  password?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
type AccountUpdateWithoutUserInput = {
  id?: StringFieldUpdateOperationsInput | string;
  accountId?: StringFieldUpdateOperationsInput | string;
  providerId?: StringFieldUpdateOperationsInput | string;
  accessToken?: NullableStringFieldUpdateOperationsInput | string | null;
  refreshToken?: NullableStringFieldUpdateOperationsInput | string | null;
  idToken?: NullableStringFieldUpdateOperationsInput | string | null;
  accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  scope?: NullableStringFieldUpdateOperationsInput | string | null;
  password?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
};
type AccountUncheckedUpdateWithoutUserInput = {
  id?: StringFieldUpdateOperationsInput | string;
  accountId?: StringFieldUpdateOperationsInput | string;
  providerId?: StringFieldUpdateOperationsInput | string;
  accessToken?: NullableStringFieldUpdateOperationsInput | string | null;
  refreshToken?: NullableStringFieldUpdateOperationsInput | string | null;
  idToken?: NullableStringFieldUpdateOperationsInput | string | null;
  accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  scope?: NullableStringFieldUpdateOperationsInput | string | null;
  password?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
};
type AccountUncheckedUpdateManyWithoutUserInput = {
  id?: StringFieldUpdateOperationsInput | string;
  accountId?: StringFieldUpdateOperationsInput | string;
  providerId?: StringFieldUpdateOperationsInput | string;
  accessToken?: NullableStringFieldUpdateOperationsInput | string | null;
  refreshToken?: NullableStringFieldUpdateOperationsInput | string | null;
  idToken?: NullableStringFieldUpdateOperationsInput | string | null;
  accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
  scope?: NullableStringFieldUpdateOperationsInput | string | null;
  password?: NullableStringFieldUpdateOperationsInput | string | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
};
type AccountSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  accountId?: boolean;
  providerId?: boolean;
  userId?: boolean;
  accessToken?: boolean;
  refreshToken?: boolean;
  idToken?: boolean;
  accessTokenExpiresAt?: boolean;
  refreshTokenExpiresAt?: boolean;
  scope?: boolean;
  password?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  user?: boolean | UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["account"]>;
type AccountSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  accountId?: boolean;
  providerId?: boolean;
  userId?: boolean;
  accessToken?: boolean;
  refreshToken?: boolean;
  idToken?: boolean;
  accessTokenExpiresAt?: boolean;
  refreshTokenExpiresAt?: boolean;
  scope?: boolean;
  password?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  user?: boolean | UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["account"]>;
type AccountSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  accountId?: boolean;
  providerId?: boolean;
  userId?: boolean;
  accessToken?: boolean;
  refreshToken?: boolean;
  idToken?: boolean;
  accessTokenExpiresAt?: boolean;
  refreshTokenExpiresAt?: boolean;
  scope?: boolean;
  password?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  user?: boolean | UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["account"]>;
type AccountSelectScalar = {
  id?: boolean;
  accountId?: boolean;
  providerId?: boolean;
  userId?: boolean;
  accessToken?: boolean;
  refreshToken?: boolean;
  idToken?: boolean;
  accessTokenExpiresAt?: boolean;
  refreshTokenExpiresAt?: boolean;
  scope?: boolean;
  password?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
};
type AccountOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "accountId" | "providerId" | "userId" | "accessToken" | "refreshToken" | "idToken" | "accessTokenExpiresAt" | "refreshTokenExpiresAt" | "scope" | "password" | "createdAt" | "updatedAt", ExtArgs["result"]["account"]>;
type AccountInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | UserDefaultArgs<ExtArgs>;
};
type AccountIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | UserDefaultArgs<ExtArgs>;
};
type AccountIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | UserDefaultArgs<ExtArgs>;
};
type $AccountPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  name: "Account";
  objects: {
    user: $UserPayload<ExtArgs>;
  };
  scalars: runtime.Types.Extensions.GetPayloadResult<{
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    accessTokenExpiresAt: Date | null;
    refreshTokenExpiresAt: Date | null;
    scope: string | null;
    password: string | null;
    createdAt: Date;
    updatedAt: Date;
  }, ExtArgs["result"]["account"]>;
  composites: {};
};
type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = runtime.Types.Result.GetResult<$AccountPayload, S>;
type AccountCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
  select?: AccountCountAggregateInputType | true;
};
interface AccountDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
  [K: symbol]: {
    types: TypeMap<ExtArgs>['model']['Account'];
    meta: {
      name: 'Account';
    };
  };
  /**
   * Find zero or one Account that matches the filter.
   * @param {AccountFindUniqueArgs} args - Arguments to find a Account
   * @example
   * // Get one Account
   * const account = await prisma.account.findUnique({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
  /**
   * Find one Account that matches the filter or throw an error with `error.code='P2025'`
   * if no matches were found.
   * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
   * @example
   * // Get one Account
   * const account = await prisma.account.findUniqueOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Find the first Account that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountFindFirstArgs} args - Arguments to find a Account
   * @example
   * // Get one Account
   * const account = await prisma.account.findFirst({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
  /**
   * Find the first Account that matches the filter or
   * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
   * @example
   * // Get one Account
   * const account = await prisma.account.findFirstOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Find zero or more Accounts that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Accounts
   * const accounts = await prisma.account.findMany()
   *
   * // Get first 10 Accounts
   * const accounts = await prisma.account.findMany({ take: 10 })
   *
   * // Only select the `id`
   * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
   *
   */
  findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
  /**
   * Create a Account.
   * @param {AccountCreateArgs} args - Arguments to create a Account.
   * @example
   * // Create one Account
   * const Account = await prisma.account.create({
   *   data: {
   *     // ... data to create a Account
   *   }
   * })
   *
   */
  create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Create many Accounts.
   * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
   * @example
   * // Create many Accounts
   * const account = await prisma.account.createMany({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   */
  createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Create many Accounts and returns the data saved in the database.
   * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
   * @example
   * // Create many Accounts
   * const account = await prisma.account.createManyAndReturn({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   * // Create many Accounts and only return the `id`
   * const accountWithIdOnly = await prisma.account.createManyAndReturn({
   *   select: { id: true },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   *
   */
  createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
  /**
   * Delete a Account.
   * @param {AccountDeleteArgs} args - Arguments to delete one Account.
   * @example
   * // Delete one Account
   * const Account = await prisma.account.delete({
   *   where: {
   *     // ... filter to delete one Account
   *   }
   * })
   *
   */
  delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Update one Account.
   * @param {AccountUpdateArgs} args - Arguments to update one Account.
   * @example
   * // Update one Account
   * const account = await prisma.account.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   *
   */
  update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Delete zero or more Accounts.
   * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
   * @example
   * // Delete a few Accounts
   * const { count } = await prisma.account.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   *
   */
  deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Update zero or more Accounts.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Accounts
   * const account = await prisma.account.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   *
   */
  updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Update zero or more Accounts and returns the data updated in the database.
   * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
   * @example
   * // Update many Accounts
   * const account = await prisma.account.updateManyAndReturn({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   * // Update zero or more Accounts and only return the `id`
   * const accountWithIdOnly = await prisma.account.updateManyAndReturn({
   *   select: { id: true },
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   *
   */
  updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
  /**
   * Create or update one Account.
   * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
   * @example
   * // Update or create a Account
   * const account = await prisma.account.upsert({
   *   create: {
   *     // ... data to create a Account
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Account we want to update
   *   }
   * })
   */
  upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<runtime.Types.Result.GetResult<$AccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Count the number of Accounts.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
   * @example
   * // Count the number of Accounts
   * const count = await prisma.account.count({
   *   where: {
   *     // ... the filter for the Accounts we want to count
   *   }
   * })
  **/
  count<T extends AccountCountArgs>(args?: Subset<T, AccountCountArgs>): PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : GetScalarType<T['select'], AccountCountAggregateOutputType> : number>;
  /**
   * Allows you to perform aggregations operations on a Account.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
   * @example
   * // Ordered by age ascending
   * // Where email contains prisma.io
   * // Limited to the 10 users
   * const aggregations = await prisma.user.aggregate({
   *   _avg: {
   *     age: true,
   *   },
   *   where: {
   *     email: {
   *       contains: "prisma.io",
   *     },
   *   },
   *   orderBy: {
   *     age: "asc",
   *   },
   *   take: 10,
   * })
  **/
  aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): PrismaPromise<GetAccountAggregateType<T>>;
  /**
   * Group by Account.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountGroupByArgs} args - Group by arguments.
   * @example
   * // Group by city, order by createdAt, get count
   * const result = await prisma.user.groupBy({
   *   by: ['city', 'createdAt'],
   *   orderBy: {
   *     createdAt: true
   *   },
   *   _count: {
   *     _all: true
   *   },
   * })
   *
  **/
  groupBy<T extends AccountGroupByArgs, HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>, OrderByArg extends (True extends HasSelectOrTake ? {
    orderBy: AccountGroupByArgs['orderBy'];
  } : {
    orderBy?: AccountGroupByArgs['orderBy'];
  }), OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>, ByFields extends MaybeTupleToUnion<T['by']>, ByValid extends Has<ByFields, OrderFields>, HavingFields extends GetHavingFields<T['having']>, HavingValid extends Has<ByFields, HavingFields>, ByEmpty extends (T['by'] extends never[] ? True : False), InputErrors extends (ByEmpty extends True ? `Error: "by" must not be empty.` : HavingValid extends False ? { [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`] }[HavingFields] : 'take' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields])>(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : PrismaPromise<InputErrors>;
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Account.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
interface Prisma__AccountClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends PrismaPromise<T> {
  readonly [Symbol.toStringTag]: "PrismaPromise";
  user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<runtime.Types.Result.GetResult<$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Account model
 */
interface AccountFieldRefs {
  readonly id: FieldRef<"Account", 'String'>;
  readonly accountId: FieldRef<"Account", 'String'>;
  readonly providerId: FieldRef<"Account", 'String'>;
  readonly userId: FieldRef<"Account", 'String'>;
  readonly accessToken: FieldRef<"Account", 'String'>;
  readonly refreshToken: FieldRef<"Account", 'String'>;
  readonly idToken: FieldRef<"Account", 'String'>;
  readonly accessTokenExpiresAt: FieldRef<"Account", 'DateTime'>;
  readonly refreshTokenExpiresAt: FieldRef<"Account", 'DateTime'>;
  readonly scope: FieldRef<"Account", 'String'>;
  readonly password: FieldRef<"Account", 'String'>;
  readonly createdAt: FieldRef<"Account", 'DateTime'>;
  readonly updatedAt: FieldRef<"Account", 'DateTime'>;
}
/**
 * Account findUnique
 */
type AccountFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
  /**
   * Filter, which Account to fetch.
   */
  where: AccountWhereUniqueInput;
};
/**
 * Account findUniqueOrThrow
 */
type AccountFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
  /**
   * Filter, which Account to fetch.
   */
  where: AccountWhereUniqueInput;
};
/**
 * Account findFirst
 */
type AccountFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
  /**
   * Filter, which Account to fetch.
   */
  where?: AccountWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Accounts to fetch.
   */
  orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for searching for Accounts.
   */
  cursor?: AccountWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Accounts from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Accounts.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Accounts.
   */
  distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[];
};
/**
 * Account findFirstOrThrow
 */
type AccountFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
  /**
   * Filter, which Account to fetch.
   */
  where?: AccountWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Accounts to fetch.
   */
  orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for searching for Accounts.
   */
  cursor?: AccountWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Accounts from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Accounts.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Accounts.
   */
  distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[];
};
/**
 * Account findMany
 */
type AccountFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
  /**
   * Filter, which Accounts to fetch.
   */
  where?: AccountWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Accounts to fetch.
   */
  orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for listing Accounts.
   */
  cursor?: AccountWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Accounts from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Accounts.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Accounts.
   */
  distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[];
};
/**
 * Account create
 */
type AccountCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
  /**
   * The data needed to create a Account.
   */
  data: XOR<AccountCreateInput, AccountUncheckedCreateInput>;
};
/**
 * Account createMany
 */
type AccountCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to create many Accounts.
   */
  data: AccountCreateManyInput | AccountCreateManyInput[];
  skipDuplicates?: boolean;
};
/**
 * Account createManyAndReturn
 */
type AccountCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelectCreateManyAndReturn<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * The data used to create many Accounts.
   */
  data: AccountCreateManyInput | AccountCreateManyInput[];
  skipDuplicates?: boolean;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Account update
 */
type AccountUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
  /**
   * The data needed to update a Account.
   */
  data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>;
  /**
   * Choose, which Account to update.
   */
  where: AccountWhereUniqueInput;
};
/**
 * Account updateMany
 */
type AccountUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to update Accounts.
   */
  data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>;
  /**
   * Filter which Accounts to update
   */
  where?: AccountWhereInput;
  /**
   * Limit how many Accounts to update.
   */
  limit?: number;
};
/**
 * Account updateManyAndReturn
 */
type AccountUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelectUpdateManyAndReturn<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * The data used to update Accounts.
   */
  data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>;
  /**
   * Filter which Accounts to update
   */
  where?: AccountWhereInput;
  /**
   * Limit how many Accounts to update.
   */
  limit?: number;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Account upsert
 */
type AccountUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
  /**
   * The filter to search for the Account to update in case it exists.
   */
  where: AccountWhereUniqueInput;
  /**
   * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
   */
  create: XOR<AccountCreateInput, AccountUncheckedCreateInput>;
  /**
   * In case the Account was found with the provided `where` argument, update it with this data.
   */
  update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>;
};
/**
 * Account delete
 */
type AccountDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
  /**
   * Filter which Account to delete.
   */
  where: AccountWhereUniqueInput;
};
/**
 * Account deleteMany
 */
type AccountDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Accounts to delete
   */
  where?: AccountWhereInput;
  /**
   * Limit how many Accounts to delete.
   */
  limit?: number;
};
/**
 * Account without action
 */
type AccountDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: AccountSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Account
   */
  omit?: AccountOmit<ExtArgs> | null;
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: AccountInclude<ExtArgs> | null;
};
//#endregion
//#region src/generated/prisma/models/Verification.d.ts
/**
 * Model Verification
 *
 */
type VerificationModel = runtime.Types.Result.DefaultSelection<$VerificationPayload>;
type AggregateVerification = {
  _count: VerificationCountAggregateOutputType | null;
  _min: VerificationMinAggregateOutputType | null;
  _max: VerificationMaxAggregateOutputType | null;
};
type VerificationMinAggregateOutputType = {
  id: string | null;
  identifier: string | null;
  value: string | null;
  expiresAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
type VerificationMaxAggregateOutputType = {
  id: string | null;
  identifier: string | null;
  value: string | null;
  expiresAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
type VerificationCountAggregateOutputType = {
  id: number;
  identifier: number;
  value: number;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
  _all: number;
};
type VerificationMinAggregateInputType = {
  id?: true;
  identifier?: true;
  value?: true;
  expiresAt?: true;
  createdAt?: true;
  updatedAt?: true;
};
type VerificationMaxAggregateInputType = {
  id?: true;
  identifier?: true;
  value?: true;
  expiresAt?: true;
  createdAt?: true;
  updatedAt?: true;
};
type VerificationCountAggregateInputType = {
  id?: true;
  identifier?: true;
  value?: true;
  expiresAt?: true;
  createdAt?: true;
  updatedAt?: true;
  _all?: true;
};
type VerificationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Verification to aggregate.
   */
  where?: VerificationWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Verifications to fetch.
   */
  orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the start position
   */
  cursor?: VerificationWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Verifications from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Verifications.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Count returned Verifications
  **/
  _count?: true | VerificationCountAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to find the minimum value
  **/
  _min?: VerificationMinAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to find the maximum value
  **/
  _max?: VerificationMaxAggregateInputType;
};
type GetVerificationAggregateType<T extends VerificationAggregateArgs> = { [P in keyof T & keyof AggregateVerification]: P extends '_count' | 'count' ? T[P] extends true ? number : GetScalarType<T[P], AggregateVerification[P]> : GetScalarType<T[P], AggregateVerification[P]> };
type VerificationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: VerificationWhereInput;
  orderBy?: VerificationOrderByWithAggregationInput | VerificationOrderByWithAggregationInput[];
  by: VerificationScalarFieldEnum[] | VerificationScalarFieldEnum;
  having?: VerificationScalarWhereWithAggregatesInput;
  take?: number;
  skip?: number;
  _count?: VerificationCountAggregateInputType | true;
  _min?: VerificationMinAggregateInputType;
  _max?: VerificationMaxAggregateInputType;
};
type VerificationGroupByOutputType = {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  _count: VerificationCountAggregateOutputType | null;
  _min: VerificationMinAggregateOutputType | null;
  _max: VerificationMaxAggregateOutputType | null;
};
type GetVerificationGroupByPayload<T extends VerificationGroupByArgs> = PrismaPromise<Array<PickEnumerable<VerificationGroupByOutputType, T['by']> & { [P in ((keyof T) & (keyof VerificationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : GetScalarType<T[P], VerificationGroupByOutputType[P]> : GetScalarType<T[P], VerificationGroupByOutputType[P]> }>>;
type VerificationWhereInput = {
  AND?: VerificationWhereInput | VerificationWhereInput[];
  OR?: VerificationWhereInput[];
  NOT?: VerificationWhereInput | VerificationWhereInput[];
  id?: StringFilter<"Verification"> | string;
  identifier?: StringFilter<"Verification"> | string;
  value?: StringFilter<"Verification"> | string;
  expiresAt?: DateTimeFilter<"Verification"> | Date | string;
  createdAt?: DateTimeFilter<"Verification"> | Date | string;
  updatedAt?: DateTimeFilter<"Verification"> | Date | string;
};
type VerificationOrderByWithRelationInput = {
  id?: SortOrder;
  identifier?: SortOrder;
  value?: SortOrder;
  expiresAt?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
};
type VerificationWhereUniqueInput = AtLeast<{
  id?: string;
  identifier_value?: VerificationIdentifierValueCompoundUniqueInput;
  AND?: VerificationWhereInput | VerificationWhereInput[];
  OR?: VerificationWhereInput[];
  NOT?: VerificationWhereInput | VerificationWhereInput[];
  identifier?: StringFilter<"Verification"> | string;
  value?: StringFilter<"Verification"> | string;
  expiresAt?: DateTimeFilter<"Verification"> | Date | string;
  createdAt?: DateTimeFilter<"Verification"> | Date | string;
  updatedAt?: DateTimeFilter<"Verification"> | Date | string;
}, "id" | "identifier_value">;
type VerificationOrderByWithAggregationInput = {
  id?: SortOrder;
  identifier?: SortOrder;
  value?: SortOrder;
  expiresAt?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  _count?: VerificationCountOrderByAggregateInput;
  _max?: VerificationMaxOrderByAggregateInput;
  _min?: VerificationMinOrderByAggregateInput;
};
type VerificationScalarWhereWithAggregatesInput = {
  AND?: VerificationScalarWhereWithAggregatesInput | VerificationScalarWhereWithAggregatesInput[];
  OR?: VerificationScalarWhereWithAggregatesInput[];
  NOT?: VerificationScalarWhereWithAggregatesInput | VerificationScalarWhereWithAggregatesInput[];
  id?: StringWithAggregatesFilter<"Verification"> | string;
  identifier?: StringWithAggregatesFilter<"Verification"> | string;
  value?: StringWithAggregatesFilter<"Verification"> | string;
  expiresAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string;
  createdAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string;
  updatedAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string;
};
type VerificationCreateInput = {
  id?: string;
  identifier: string;
  value: string;
  expiresAt: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
type VerificationUncheckedCreateInput = {
  id?: string;
  identifier: string;
  value: string;
  expiresAt: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
type VerificationUpdateInput = {
  id?: StringFieldUpdateOperationsInput | string;
  identifier?: StringFieldUpdateOperationsInput | string;
  value?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
};
type VerificationUncheckedUpdateInput = {
  id?: StringFieldUpdateOperationsInput | string;
  identifier?: StringFieldUpdateOperationsInput | string;
  value?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
};
type VerificationCreateManyInput = {
  id?: string;
  identifier: string;
  value: string;
  expiresAt: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
type VerificationUpdateManyMutationInput = {
  id?: StringFieldUpdateOperationsInput | string;
  identifier?: StringFieldUpdateOperationsInput | string;
  value?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
};
type VerificationUncheckedUpdateManyInput = {
  id?: StringFieldUpdateOperationsInput | string;
  identifier?: StringFieldUpdateOperationsInput | string;
  value?: StringFieldUpdateOperationsInput | string;
  expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
};
type VerificationIdentifierValueCompoundUniqueInput = {
  identifier: string;
  value: string;
};
type VerificationCountOrderByAggregateInput = {
  id?: SortOrder;
  identifier?: SortOrder;
  value?: SortOrder;
  expiresAt?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
};
type VerificationMaxOrderByAggregateInput = {
  id?: SortOrder;
  identifier?: SortOrder;
  value?: SortOrder;
  expiresAt?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
};
type VerificationMinOrderByAggregateInput = {
  id?: SortOrder;
  identifier?: SortOrder;
  value?: SortOrder;
  expiresAt?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
};
type VerificationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  identifier?: boolean;
  value?: boolean;
  expiresAt?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
}, ExtArgs["result"]["verification"]>;
type VerificationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  identifier?: boolean;
  value?: boolean;
  expiresAt?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
}, ExtArgs["result"]["verification"]>;
type VerificationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  identifier?: boolean;
  value?: boolean;
  expiresAt?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
}, ExtArgs["result"]["verification"]>;
type VerificationSelectScalar = {
  id?: boolean;
  identifier?: boolean;
  value?: boolean;
  expiresAt?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
};
type VerificationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "identifier" | "value" | "expiresAt" | "createdAt" | "updatedAt", ExtArgs["result"]["verification"]>;
type $VerificationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  name: "Verification";
  objects: {};
  scalars: runtime.Types.Extensions.GetPayloadResult<{
    id: string;
    identifier: string;
    value: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }, ExtArgs["result"]["verification"]>;
  composites: {};
};
type VerificationGetPayload<S extends boolean | null | undefined | VerificationDefaultArgs> = runtime.Types.Result.GetResult<$VerificationPayload, S>;
type VerificationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<VerificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
  select?: VerificationCountAggregateInputType | true;
};
interface VerificationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
  [K: symbol]: {
    types: TypeMap<ExtArgs>['model']['Verification'];
    meta: {
      name: 'Verification';
    };
  };
  /**
   * Find zero or one Verification that matches the filter.
   * @param {VerificationFindUniqueArgs} args - Arguments to find a Verification
   * @example
   * // Get one Verification
   * const verification = await prisma.verification.findUnique({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUnique<T extends VerificationFindUniqueArgs>(args: SelectSubset<T, VerificationFindUniqueArgs<ExtArgs>>): Prisma__VerificationClient<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
  /**
   * Find one Verification that matches the filter or throw an error with `error.code='P2025'`
   * if no matches were found.
   * @param {VerificationFindUniqueOrThrowArgs} args - Arguments to find a Verification
   * @example
   * // Get one Verification
   * const verification = await prisma.verification.findUniqueOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUniqueOrThrow<T extends VerificationFindUniqueOrThrowArgs>(args: SelectSubset<T, VerificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VerificationClient<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Find the first Verification that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationFindFirstArgs} args - Arguments to find a Verification
   * @example
   * // Get one Verification
   * const verification = await prisma.verification.findFirst({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirst<T extends VerificationFindFirstArgs>(args?: SelectSubset<T, VerificationFindFirstArgs<ExtArgs>>): Prisma__VerificationClient<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
  /**
   * Find the first Verification that matches the filter or
   * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationFindFirstOrThrowArgs} args - Arguments to find a Verification
   * @example
   * // Get one Verification
   * const verification = await prisma.verification.findFirstOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirstOrThrow<T extends VerificationFindFirstOrThrowArgs>(args?: SelectSubset<T, VerificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__VerificationClient<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Find zero or more Verifications that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationFindManyArgs} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Verifications
   * const verifications = await prisma.verification.findMany()
   *
   * // Get first 10 Verifications
   * const verifications = await prisma.verification.findMany({ take: 10 })
   *
   * // Only select the `id`
   * const verificationWithIdOnly = await prisma.verification.findMany({ select: { id: true } })
   *
   */
  findMany<T extends VerificationFindManyArgs>(args?: SelectSubset<T, VerificationFindManyArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
  /**
   * Create a Verification.
   * @param {VerificationCreateArgs} args - Arguments to create a Verification.
   * @example
   * // Create one Verification
   * const Verification = await prisma.verification.create({
   *   data: {
   *     // ... data to create a Verification
   *   }
   * })
   *
   */
  create<T extends VerificationCreateArgs>(args: SelectSubset<T, VerificationCreateArgs<ExtArgs>>): Prisma__VerificationClient<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Create many Verifications.
   * @param {VerificationCreateManyArgs} args - Arguments to create many Verifications.
   * @example
   * // Create many Verifications
   * const verification = await prisma.verification.createMany({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   */
  createMany<T extends VerificationCreateManyArgs>(args?: SelectSubset<T, VerificationCreateManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Create many Verifications and returns the data saved in the database.
   * @param {VerificationCreateManyAndReturnArgs} args - Arguments to create many Verifications.
   * @example
   * // Create many Verifications
   * const verification = await prisma.verification.createManyAndReturn({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   * // Create many Verifications and only return the `id`
   * const verificationWithIdOnly = await prisma.verification.createManyAndReturn({
   *   select: { id: true },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   *
   */
  createManyAndReturn<T extends VerificationCreateManyAndReturnArgs>(args?: SelectSubset<T, VerificationCreateManyAndReturnArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
  /**
   * Delete a Verification.
   * @param {VerificationDeleteArgs} args - Arguments to delete one Verification.
   * @example
   * // Delete one Verification
   * const Verification = await prisma.verification.delete({
   *   where: {
   *     // ... filter to delete one Verification
   *   }
   * })
   *
   */
  delete<T extends VerificationDeleteArgs>(args: SelectSubset<T, VerificationDeleteArgs<ExtArgs>>): Prisma__VerificationClient<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Update one Verification.
   * @param {VerificationUpdateArgs} args - Arguments to update one Verification.
   * @example
   * // Update one Verification
   * const verification = await prisma.verification.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   *
   */
  update<T extends VerificationUpdateArgs>(args: SelectSubset<T, VerificationUpdateArgs<ExtArgs>>): Prisma__VerificationClient<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Delete zero or more Verifications.
   * @param {VerificationDeleteManyArgs} args - Arguments to filter Verifications to delete.
   * @example
   * // Delete a few Verifications
   * const { count } = await prisma.verification.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   *
   */
  deleteMany<T extends VerificationDeleteManyArgs>(args?: SelectSubset<T, VerificationDeleteManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Update zero or more Verifications.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Verifications
   * const verification = await prisma.verification.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   *
   */
  updateMany<T extends VerificationUpdateManyArgs>(args: SelectSubset<T, VerificationUpdateManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Update zero or more Verifications and returns the data updated in the database.
   * @param {VerificationUpdateManyAndReturnArgs} args - Arguments to update many Verifications.
   * @example
   * // Update many Verifications
   * const verification = await prisma.verification.updateManyAndReturn({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   * // Update zero or more Verifications and only return the `id`
   * const verificationWithIdOnly = await prisma.verification.updateManyAndReturn({
   *   select: { id: true },
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   *
   */
  updateManyAndReturn<T extends VerificationUpdateManyAndReturnArgs>(args: SelectSubset<T, VerificationUpdateManyAndReturnArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
  /**
   * Create or update one Verification.
   * @param {VerificationUpsertArgs} args - Arguments to update or create a Verification.
   * @example
   * // Update or create a Verification
   * const verification = await prisma.verification.upsert({
   *   create: {
   *     // ... data to create a Verification
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Verification we want to update
   *   }
   * })
   */
  upsert<T extends VerificationUpsertArgs>(args: SelectSubset<T, VerificationUpsertArgs<ExtArgs>>): Prisma__VerificationClient<runtime.Types.Result.GetResult<$VerificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Count the number of Verifications.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationCountArgs} args - Arguments to filter Verifications to count.
   * @example
   * // Count the number of Verifications
   * const count = await prisma.verification.count({
   *   where: {
   *     // ... the filter for the Verifications we want to count
   *   }
   * })
  **/
  count<T extends VerificationCountArgs>(args?: Subset<T, VerificationCountArgs>): PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : GetScalarType<T['select'], VerificationCountAggregateOutputType> : number>;
  /**
   * Allows you to perform aggregations operations on a Verification.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
   * @example
   * // Ordered by age ascending
   * // Where email contains prisma.io
   * // Limited to the 10 users
   * const aggregations = await prisma.user.aggregate({
   *   _avg: {
   *     age: true,
   *   },
   *   where: {
   *     email: {
   *       contains: "prisma.io",
   *     },
   *   },
   *   orderBy: {
   *     age: "asc",
   *   },
   *   take: 10,
   * })
  **/
  aggregate<T extends VerificationAggregateArgs>(args: Subset<T, VerificationAggregateArgs>): PrismaPromise<GetVerificationAggregateType<T>>;
  /**
   * Group by Verification.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationGroupByArgs} args - Group by arguments.
   * @example
   * // Group by city, order by createdAt, get count
   * const result = await prisma.user.groupBy({
   *   by: ['city', 'createdAt'],
   *   orderBy: {
   *     createdAt: true
   *   },
   *   _count: {
   *     _all: true
   *   },
   * })
   *
  **/
  groupBy<T extends VerificationGroupByArgs, HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>, OrderByArg extends (True extends HasSelectOrTake ? {
    orderBy: VerificationGroupByArgs['orderBy'];
  } : {
    orderBy?: VerificationGroupByArgs['orderBy'];
  }), OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>, ByFields extends MaybeTupleToUnion<T['by']>, ByValid extends Has<ByFields, OrderFields>, HavingFields extends GetHavingFields<T['having']>, HavingValid extends Has<ByFields, HavingFields>, ByEmpty extends (T['by'] extends never[] ? True : False), InputErrors extends (ByEmpty extends True ? `Error: "by" must not be empty.` : HavingValid extends False ? { [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`] }[HavingFields] : 'take' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields])>(args: SubsetIntersection<T, VerificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationGroupByPayload<T> : PrismaPromise<InputErrors>;
  /**
   * Fields of the Verification model
   */
  readonly fields: VerificationFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Verification.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
interface Prisma__VerificationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends PrismaPromise<T> {
  readonly [Symbol.toStringTag]: "PrismaPromise";
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Verification model
 */
interface VerificationFieldRefs {
  readonly id: FieldRef<"Verification", 'String'>;
  readonly identifier: FieldRef<"Verification", 'String'>;
  readonly value: FieldRef<"Verification", 'String'>;
  readonly expiresAt: FieldRef<"Verification", 'DateTime'>;
  readonly createdAt: FieldRef<"Verification", 'DateTime'>;
  readonly updatedAt: FieldRef<"Verification", 'DateTime'>;
}
/**
 * Verification findUnique
 */
type VerificationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * Filter, which Verification to fetch.
   */
  where: VerificationWhereUniqueInput;
};
/**
 * Verification findUniqueOrThrow
 */
type VerificationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * Filter, which Verification to fetch.
   */
  where: VerificationWhereUniqueInput;
};
/**
 * Verification findFirst
 */
type VerificationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * Filter, which Verification to fetch.
   */
  where?: VerificationWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Verifications to fetch.
   */
  orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for searching for Verifications.
   */
  cursor?: VerificationWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Verifications from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Verifications.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Verifications.
   */
  distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[];
};
/**
 * Verification findFirstOrThrow
 */
type VerificationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * Filter, which Verification to fetch.
   */
  where?: VerificationWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Verifications to fetch.
   */
  orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for searching for Verifications.
   */
  cursor?: VerificationWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Verifications from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Verifications.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Verifications.
   */
  distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[];
};
/**
 * Verification findMany
 */
type VerificationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * Filter, which Verifications to fetch.
   */
  where?: VerificationWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of Verifications to fetch.
   */
  orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for listing Verifications.
   */
  cursor?: VerificationWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` Verifications from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` Verifications.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of Verifications.
   */
  distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[];
};
/**
 * Verification create
 */
type VerificationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * The data needed to create a Verification.
   */
  data: XOR<VerificationCreateInput, VerificationUncheckedCreateInput>;
};
/**
 * Verification createMany
 */
type VerificationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to create many Verifications.
   */
  data: VerificationCreateManyInput | VerificationCreateManyInput[];
  skipDuplicates?: boolean;
};
/**
 * Verification createManyAndReturn
 */
type VerificationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelectCreateManyAndReturn<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * The data used to create many Verifications.
   */
  data: VerificationCreateManyInput | VerificationCreateManyInput[];
  skipDuplicates?: boolean;
};
/**
 * Verification update
 */
type VerificationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * The data needed to update a Verification.
   */
  data: XOR<VerificationUpdateInput, VerificationUncheckedUpdateInput>;
  /**
   * Choose, which Verification to update.
   */
  where: VerificationWhereUniqueInput;
};
/**
 * Verification updateMany
 */
type VerificationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to update Verifications.
   */
  data: XOR<VerificationUpdateManyMutationInput, VerificationUncheckedUpdateManyInput>;
  /**
   * Filter which Verifications to update
   */
  where?: VerificationWhereInput;
  /**
   * Limit how many Verifications to update.
   */
  limit?: number;
};
/**
 * Verification updateManyAndReturn
 */
type VerificationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelectUpdateManyAndReturn<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * The data used to update Verifications.
   */
  data: XOR<VerificationUpdateManyMutationInput, VerificationUncheckedUpdateManyInput>;
  /**
   * Filter which Verifications to update
   */
  where?: VerificationWhereInput;
  /**
   * Limit how many Verifications to update.
   */
  limit?: number;
};
/**
 * Verification upsert
 */
type VerificationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * The filter to search for the Verification to update in case it exists.
   */
  where: VerificationWhereUniqueInput;
  /**
   * In case the Verification found by the `where` argument doesn't exist, create a new Verification with this data.
   */
  create: XOR<VerificationCreateInput, VerificationUncheckedCreateInput>;
  /**
   * In case the Verification was found with the provided `where` argument, update it with this data.
   */
  update: XOR<VerificationUpdateInput, VerificationUncheckedUpdateInput>;
};
/**
 * Verification delete
 */
type VerificationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
  /**
   * Filter which Verification to delete.
   */
  where: VerificationWhereUniqueInput;
};
/**
 * Verification deleteMany
 */
type VerificationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Verifications to delete
   */
  where?: VerificationWhereInput;
  /**
   * Limit how many Verifications to delete.
   */
  limit?: number;
};
/**
 * Verification without action
 */
type VerificationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: VerificationSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the Verification
   */
  omit?: VerificationOmit<ExtArgs> | null;
};
//#endregion
//#region src/generated/prisma/models/RateLimit.d.ts
/**
 * Model RateLimit
 *
 */
type RateLimitModel = runtime.Types.Result.DefaultSelection<$RateLimitPayload>;
type AggregateRateLimit = {
  _count: RateLimitCountAggregateOutputType | null;
  _avg: RateLimitAvgAggregateOutputType | null;
  _sum: RateLimitSumAggregateOutputType | null;
  _min: RateLimitMinAggregateOutputType | null;
  _max: RateLimitMaxAggregateOutputType | null;
};
type RateLimitAvgAggregateOutputType = {
  count: number | null;
  lastRequest: number | null;
};
type RateLimitSumAggregateOutputType = {
  count: number | null;
  lastRequest: bigint | null;
};
type RateLimitMinAggregateOutputType = {
  id: string | null;
  key: string | null;
  count: number | null;
  lastRequest: bigint | null;
};
type RateLimitMaxAggregateOutputType = {
  id: string | null;
  key: string | null;
  count: number | null;
  lastRequest: bigint | null;
};
type RateLimitCountAggregateOutputType = {
  id: number;
  key: number;
  count: number;
  lastRequest: number;
  _all: number;
};
type RateLimitAvgAggregateInputType = {
  count?: true;
  lastRequest?: true;
};
type RateLimitSumAggregateInputType = {
  count?: true;
  lastRequest?: true;
};
type RateLimitMinAggregateInputType = {
  id?: true;
  key?: true;
  count?: true;
  lastRequest?: true;
};
type RateLimitMaxAggregateInputType = {
  id?: true;
  key?: true;
  count?: true;
  lastRequest?: true;
};
type RateLimitCountAggregateInputType = {
  id?: true;
  key?: true;
  count?: true;
  lastRequest?: true;
  _all?: true;
};
type RateLimitAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which RateLimit to aggregate.
   */
  where?: RateLimitWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of RateLimits to fetch.
   */
  orderBy?: RateLimitOrderByWithRelationInput | RateLimitOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the start position
   */
  cursor?: RateLimitWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` RateLimits from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` RateLimits.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Count returned RateLimits
  **/
  _count?: true | RateLimitCountAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to average
  **/
  _avg?: RateLimitAvgAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to sum
  **/
  _sum?: RateLimitSumAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to find the minimum value
  **/
  _min?: RateLimitMinAggregateInputType;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   *
   * Select which fields to find the maximum value
  **/
  _max?: RateLimitMaxAggregateInputType;
};
type GetRateLimitAggregateType<T extends RateLimitAggregateArgs> = { [P in keyof T & keyof AggregateRateLimit]: P extends '_count' | 'count' ? T[P] extends true ? number : GetScalarType<T[P], AggregateRateLimit[P]> : GetScalarType<T[P], AggregateRateLimit[P]> };
type RateLimitGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: RateLimitWhereInput;
  orderBy?: RateLimitOrderByWithAggregationInput | RateLimitOrderByWithAggregationInput[];
  by: RateLimitScalarFieldEnum[] | RateLimitScalarFieldEnum;
  having?: RateLimitScalarWhereWithAggregatesInput;
  take?: number;
  skip?: number;
  _count?: RateLimitCountAggregateInputType | true;
  _avg?: RateLimitAvgAggregateInputType;
  _sum?: RateLimitSumAggregateInputType;
  _min?: RateLimitMinAggregateInputType;
  _max?: RateLimitMaxAggregateInputType;
};
type RateLimitGroupByOutputType = {
  id: string;
  key: string;
  count: number;
  lastRequest: bigint;
  _count: RateLimitCountAggregateOutputType | null;
  _avg: RateLimitAvgAggregateOutputType | null;
  _sum: RateLimitSumAggregateOutputType | null;
  _min: RateLimitMinAggregateOutputType | null;
  _max: RateLimitMaxAggregateOutputType | null;
};
type GetRateLimitGroupByPayload<T extends RateLimitGroupByArgs> = PrismaPromise<Array<PickEnumerable<RateLimitGroupByOutputType, T['by']> & { [P in ((keyof T) & (keyof RateLimitGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : GetScalarType<T[P], RateLimitGroupByOutputType[P]> : GetScalarType<T[P], RateLimitGroupByOutputType[P]> }>>;
type RateLimitWhereInput = {
  AND?: RateLimitWhereInput | RateLimitWhereInput[];
  OR?: RateLimitWhereInput[];
  NOT?: RateLimitWhereInput | RateLimitWhereInput[];
  id?: StringFilter<"RateLimit"> | string;
  key?: StringFilter<"RateLimit"> | string;
  count?: IntFilter<"RateLimit"> | number;
  lastRequest?: BigIntFilter<"RateLimit"> | bigint | number;
};
type RateLimitOrderByWithRelationInput = {
  id?: SortOrder;
  key?: SortOrder;
  count?: SortOrder;
  lastRequest?: SortOrder;
};
type RateLimitWhereUniqueInput = AtLeast<{
  id?: string;
  key?: string;
  AND?: RateLimitWhereInput | RateLimitWhereInput[];
  OR?: RateLimitWhereInput[];
  NOT?: RateLimitWhereInput | RateLimitWhereInput[];
  count?: IntFilter<"RateLimit"> | number;
  lastRequest?: BigIntFilter<"RateLimit"> | bigint | number;
}, "id" | "key">;
type RateLimitOrderByWithAggregationInput = {
  id?: SortOrder;
  key?: SortOrder;
  count?: SortOrder;
  lastRequest?: SortOrder;
  _count?: RateLimitCountOrderByAggregateInput;
  _avg?: RateLimitAvgOrderByAggregateInput;
  _max?: RateLimitMaxOrderByAggregateInput;
  _min?: RateLimitMinOrderByAggregateInput;
  _sum?: RateLimitSumOrderByAggregateInput;
};
type RateLimitScalarWhereWithAggregatesInput = {
  AND?: RateLimitScalarWhereWithAggregatesInput | RateLimitScalarWhereWithAggregatesInput[];
  OR?: RateLimitScalarWhereWithAggregatesInput[];
  NOT?: RateLimitScalarWhereWithAggregatesInput | RateLimitScalarWhereWithAggregatesInput[];
  id?: StringWithAggregatesFilter<"RateLimit"> | string;
  key?: StringWithAggregatesFilter<"RateLimit"> | string;
  count?: IntWithAggregatesFilter<"RateLimit"> | number;
  lastRequest?: BigIntWithAggregatesFilter<"RateLimit"> | bigint | number;
};
type RateLimitCreateInput = {
  id?: string;
  key: string;
  count: number;
  lastRequest: bigint | number;
};
type RateLimitUncheckedCreateInput = {
  id?: string;
  key: string;
  count: number;
  lastRequest: bigint | number;
};
type RateLimitUpdateInput = {
  id?: StringFieldUpdateOperationsInput | string;
  key?: StringFieldUpdateOperationsInput | string;
  count?: IntFieldUpdateOperationsInput | number;
  lastRequest?: BigIntFieldUpdateOperationsInput | bigint | number;
};
type RateLimitUncheckedUpdateInput = {
  id?: StringFieldUpdateOperationsInput | string;
  key?: StringFieldUpdateOperationsInput | string;
  count?: IntFieldUpdateOperationsInput | number;
  lastRequest?: BigIntFieldUpdateOperationsInput | bigint | number;
};
type RateLimitCreateManyInput = {
  id?: string;
  key: string;
  count: number;
  lastRequest: bigint | number;
};
type RateLimitUpdateManyMutationInput = {
  id?: StringFieldUpdateOperationsInput | string;
  key?: StringFieldUpdateOperationsInput | string;
  count?: IntFieldUpdateOperationsInput | number;
  lastRequest?: BigIntFieldUpdateOperationsInput | bigint | number;
};
type RateLimitUncheckedUpdateManyInput = {
  id?: StringFieldUpdateOperationsInput | string;
  key?: StringFieldUpdateOperationsInput | string;
  count?: IntFieldUpdateOperationsInput | number;
  lastRequest?: BigIntFieldUpdateOperationsInput | bigint | number;
};
type RateLimitCountOrderByAggregateInput = {
  id?: SortOrder;
  key?: SortOrder;
  count?: SortOrder;
  lastRequest?: SortOrder;
};
type RateLimitAvgOrderByAggregateInput = {
  count?: SortOrder;
  lastRequest?: SortOrder;
};
type RateLimitMaxOrderByAggregateInput = {
  id?: SortOrder;
  key?: SortOrder;
  count?: SortOrder;
  lastRequest?: SortOrder;
};
type RateLimitMinOrderByAggregateInput = {
  id?: SortOrder;
  key?: SortOrder;
  count?: SortOrder;
  lastRequest?: SortOrder;
};
type RateLimitSumOrderByAggregateInput = {
  count?: SortOrder;
  lastRequest?: SortOrder;
};
type IntFieldUpdateOperationsInput = {
  set?: number;
  increment?: number;
  decrement?: number;
  multiply?: number;
  divide?: number;
};
type BigIntFieldUpdateOperationsInput = {
  set?: bigint | number;
  increment?: bigint | number;
  decrement?: bigint | number;
  multiply?: bigint | number;
  divide?: bigint | number;
};
type RateLimitSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  key?: boolean;
  count?: boolean;
  lastRequest?: boolean;
}, ExtArgs["result"]["rateLimit"]>;
type RateLimitSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  key?: boolean;
  count?: boolean;
  lastRequest?: boolean;
}, ExtArgs["result"]["rateLimit"]>;
type RateLimitSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean;
  key?: boolean;
  count?: boolean;
  lastRequest?: boolean;
}, ExtArgs["result"]["rateLimit"]>;
type RateLimitSelectScalar = {
  id?: boolean;
  key?: boolean;
  count?: boolean;
  lastRequest?: boolean;
};
type RateLimitOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "key" | "count" | "lastRequest", ExtArgs["result"]["rateLimit"]>;
type $RateLimitPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  name: "RateLimit";
  objects: {};
  scalars: runtime.Types.Extensions.GetPayloadResult<{
    id: string;
    key: string;
    count: number;
    lastRequest: bigint;
  }, ExtArgs["result"]["rateLimit"]>;
  composites: {};
};
type RateLimitGetPayload<S extends boolean | null | undefined | RateLimitDefaultArgs> = runtime.Types.Result.GetResult<$RateLimitPayload, S>;
type RateLimitCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RateLimitFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
  select?: RateLimitCountAggregateInputType | true;
};
interface RateLimitDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
  [K: symbol]: {
    types: TypeMap<ExtArgs>['model']['RateLimit'];
    meta: {
      name: 'RateLimit';
    };
  };
  /**
   * Find zero or one RateLimit that matches the filter.
   * @param {RateLimitFindUniqueArgs} args - Arguments to find a RateLimit
   * @example
   * // Get one RateLimit
   * const rateLimit = await prisma.rateLimit.findUnique({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUnique<T extends RateLimitFindUniqueArgs>(args: SelectSubset<T, RateLimitFindUniqueArgs<ExtArgs>>): Prisma__RateLimitClient<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
  /**
   * Find one RateLimit that matches the filter or throw an error with `error.code='P2025'`
   * if no matches were found.
   * @param {RateLimitFindUniqueOrThrowArgs} args - Arguments to find a RateLimit
   * @example
   * // Get one RateLimit
   * const rateLimit = await prisma.rateLimit.findUniqueOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUniqueOrThrow<T extends RateLimitFindUniqueOrThrowArgs>(args: SelectSubset<T, RateLimitFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RateLimitClient<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Find the first RateLimit that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {RateLimitFindFirstArgs} args - Arguments to find a RateLimit
   * @example
   * // Get one RateLimit
   * const rateLimit = await prisma.rateLimit.findFirst({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirst<T extends RateLimitFindFirstArgs>(args?: SelectSubset<T, RateLimitFindFirstArgs<ExtArgs>>): Prisma__RateLimitClient<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
  /**
   * Find the first RateLimit that matches the filter or
   * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {RateLimitFindFirstOrThrowArgs} args - Arguments to find a RateLimit
   * @example
   * // Get one RateLimit
   * const rateLimit = await prisma.rateLimit.findFirstOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirstOrThrow<T extends RateLimitFindFirstOrThrowArgs>(args?: SelectSubset<T, RateLimitFindFirstOrThrowArgs<ExtArgs>>): Prisma__RateLimitClient<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Find zero or more RateLimits that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {RateLimitFindManyArgs} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all RateLimits
   * const rateLimits = await prisma.rateLimit.findMany()
   *
   * // Get first 10 RateLimits
   * const rateLimits = await prisma.rateLimit.findMany({ take: 10 })
   *
   * // Only select the `id`
   * const rateLimitWithIdOnly = await prisma.rateLimit.findMany({ select: { id: true } })
   *
   */
  findMany<T extends RateLimitFindManyArgs>(args?: SelectSubset<T, RateLimitFindManyArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
  /**
   * Create a RateLimit.
   * @param {RateLimitCreateArgs} args - Arguments to create a RateLimit.
   * @example
   * // Create one RateLimit
   * const RateLimit = await prisma.rateLimit.create({
   *   data: {
   *     // ... data to create a RateLimit
   *   }
   * })
   *
   */
  create<T extends RateLimitCreateArgs>(args: SelectSubset<T, RateLimitCreateArgs<ExtArgs>>): Prisma__RateLimitClient<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Create many RateLimits.
   * @param {RateLimitCreateManyArgs} args - Arguments to create many RateLimits.
   * @example
   * // Create many RateLimits
   * const rateLimit = await prisma.rateLimit.createMany({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   */
  createMany<T extends RateLimitCreateManyArgs>(args?: SelectSubset<T, RateLimitCreateManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Create many RateLimits and returns the data saved in the database.
   * @param {RateLimitCreateManyAndReturnArgs} args - Arguments to create many RateLimits.
   * @example
   * // Create many RateLimits
   * const rateLimit = await prisma.rateLimit.createManyAndReturn({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   * // Create many RateLimits and only return the `id`
   * const rateLimitWithIdOnly = await prisma.rateLimit.createManyAndReturn({
   *   select: { id: true },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   *
   */
  createManyAndReturn<T extends RateLimitCreateManyAndReturnArgs>(args?: SelectSubset<T, RateLimitCreateManyAndReturnArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
  /**
   * Delete a RateLimit.
   * @param {RateLimitDeleteArgs} args - Arguments to delete one RateLimit.
   * @example
   * // Delete one RateLimit
   * const RateLimit = await prisma.rateLimit.delete({
   *   where: {
   *     // ... filter to delete one RateLimit
   *   }
   * })
   *
   */
  delete<T extends RateLimitDeleteArgs>(args: SelectSubset<T, RateLimitDeleteArgs<ExtArgs>>): Prisma__RateLimitClient<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Update one RateLimit.
   * @param {RateLimitUpdateArgs} args - Arguments to update one RateLimit.
   * @example
   * // Update one RateLimit
   * const rateLimit = await prisma.rateLimit.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   *
   */
  update<T extends RateLimitUpdateArgs>(args: SelectSubset<T, RateLimitUpdateArgs<ExtArgs>>): Prisma__RateLimitClient<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Delete zero or more RateLimits.
   * @param {RateLimitDeleteManyArgs} args - Arguments to filter RateLimits to delete.
   * @example
   * // Delete a few RateLimits
   * const { count } = await prisma.rateLimit.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   *
   */
  deleteMany<T extends RateLimitDeleteManyArgs>(args?: SelectSubset<T, RateLimitDeleteManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Update zero or more RateLimits.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {RateLimitUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many RateLimits
   * const rateLimit = await prisma.rateLimit.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   *
   */
  updateMany<T extends RateLimitUpdateManyArgs>(args: SelectSubset<T, RateLimitUpdateManyArgs<ExtArgs>>): PrismaPromise<BatchPayload>;
  /**
   * Update zero or more RateLimits and returns the data updated in the database.
   * @param {RateLimitUpdateManyAndReturnArgs} args - Arguments to update many RateLimits.
   * @example
   * // Update many RateLimits
   * const rateLimit = await prisma.rateLimit.updateManyAndReturn({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *
   * // Update zero or more RateLimits and only return the `id`
   * const rateLimitWithIdOnly = await prisma.rateLimit.updateManyAndReturn({
   *   select: { id: true },
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   *
   */
  updateManyAndReturn<T extends RateLimitUpdateManyAndReturnArgs>(args: SelectSubset<T, RateLimitUpdateManyAndReturnArgs<ExtArgs>>): PrismaPromise<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
  /**
   * Create or update one RateLimit.
   * @param {RateLimitUpsertArgs} args - Arguments to update or create a RateLimit.
   * @example
   * // Update or create a RateLimit
   * const rateLimit = await prisma.rateLimit.upsert({
   *   create: {
   *     // ... data to create a RateLimit
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the RateLimit we want to update
   *   }
   * })
   */
  upsert<T extends RateLimitUpsertArgs>(args: SelectSubset<T, RateLimitUpsertArgs<ExtArgs>>): Prisma__RateLimitClient<runtime.Types.Result.GetResult<$RateLimitPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
  /**
   * Count the number of RateLimits.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {RateLimitCountArgs} args - Arguments to filter RateLimits to count.
   * @example
   * // Count the number of RateLimits
   * const count = await prisma.rateLimit.count({
   *   where: {
   *     // ... the filter for the RateLimits we want to count
   *   }
   * })
  **/
  count<T extends RateLimitCountArgs>(args?: Subset<T, RateLimitCountArgs>): PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : GetScalarType<T['select'], RateLimitCountAggregateOutputType> : number>;
  /**
   * Allows you to perform aggregations operations on a RateLimit.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {RateLimitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
   * @example
   * // Ordered by age ascending
   * // Where email contains prisma.io
   * // Limited to the 10 users
   * const aggregations = await prisma.user.aggregate({
   *   _avg: {
   *     age: true,
   *   },
   *   where: {
   *     email: {
   *       contains: "prisma.io",
   *     },
   *   },
   *   orderBy: {
   *     age: "asc",
   *   },
   *   take: 10,
   * })
  **/
  aggregate<T extends RateLimitAggregateArgs>(args: Subset<T, RateLimitAggregateArgs>): PrismaPromise<GetRateLimitAggregateType<T>>;
  /**
   * Group by RateLimit.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {RateLimitGroupByArgs} args - Group by arguments.
   * @example
   * // Group by city, order by createdAt, get count
   * const result = await prisma.user.groupBy({
   *   by: ['city', 'createdAt'],
   *   orderBy: {
   *     createdAt: true
   *   },
   *   _count: {
   *     _all: true
   *   },
   * })
   *
  **/
  groupBy<T extends RateLimitGroupByArgs, HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>, OrderByArg extends (True extends HasSelectOrTake ? {
    orderBy: RateLimitGroupByArgs['orderBy'];
  } : {
    orderBy?: RateLimitGroupByArgs['orderBy'];
  }), OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>, ByFields extends MaybeTupleToUnion<T['by']>, ByValid extends Has<ByFields, OrderFields>, HavingFields extends GetHavingFields<T['having']>, HavingValid extends Has<ByFields, HavingFields>, ByEmpty extends (T['by'] extends never[] ? True : False), InputErrors extends (ByEmpty extends True ? `Error: "by" must not be empty.` : HavingValid extends False ? { [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`] }[HavingFields] : 'take' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields])>(args: SubsetIntersection<T, RateLimitGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRateLimitGroupByPayload<T> : PrismaPromise<InputErrors>;
  /**
   * Fields of the RateLimit model
   */
  readonly fields: RateLimitFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for RateLimit.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
interface Prisma__RateLimitClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends PrismaPromise<T> {
  readonly [Symbol.toStringTag]: "PrismaPromise";
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the RateLimit model
 */
interface RateLimitFieldRefs {
  readonly id: FieldRef<"RateLimit", 'String'>;
  readonly key: FieldRef<"RateLimit", 'String'>;
  readonly count: FieldRef<"RateLimit", 'Int'>;
  readonly lastRequest: FieldRef<"RateLimit", 'BigInt'>;
}
/**
 * RateLimit findUnique
 */
type RateLimitFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * Filter, which RateLimit to fetch.
   */
  where: RateLimitWhereUniqueInput;
};
/**
 * RateLimit findUniqueOrThrow
 */
type RateLimitFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * Filter, which RateLimit to fetch.
   */
  where: RateLimitWhereUniqueInput;
};
/**
 * RateLimit findFirst
 */
type RateLimitFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * Filter, which RateLimit to fetch.
   */
  where?: RateLimitWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of RateLimits to fetch.
   */
  orderBy?: RateLimitOrderByWithRelationInput | RateLimitOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for searching for RateLimits.
   */
  cursor?: RateLimitWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` RateLimits from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` RateLimits.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of RateLimits.
   */
  distinct?: RateLimitScalarFieldEnum | RateLimitScalarFieldEnum[];
};
/**
 * RateLimit findFirstOrThrow
 */
type RateLimitFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * Filter, which RateLimit to fetch.
   */
  where?: RateLimitWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of RateLimits to fetch.
   */
  orderBy?: RateLimitOrderByWithRelationInput | RateLimitOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for searching for RateLimits.
   */
  cursor?: RateLimitWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` RateLimits from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` RateLimits.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of RateLimits.
   */
  distinct?: RateLimitScalarFieldEnum | RateLimitScalarFieldEnum[];
};
/**
 * RateLimit findMany
 */
type RateLimitFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * Filter, which RateLimits to fetch.
   */
  where?: RateLimitWhereInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   *
   * Determine the order of RateLimits to fetch.
   */
  orderBy?: RateLimitOrderByWithRelationInput | RateLimitOrderByWithRelationInput[];
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   *
   * Sets the position for listing RateLimits.
   */
  cursor?: RateLimitWhereUniqueInput;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Take `±n` RateLimits from the position of the cursor.
   */
  take?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   *
   * Skip the first `n` RateLimits.
   */
  skip?: number;
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   *
   * Filter by unique combinations of RateLimits.
   */
  distinct?: RateLimitScalarFieldEnum | RateLimitScalarFieldEnum[];
};
/**
 * RateLimit create
 */
type RateLimitCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * The data needed to create a RateLimit.
   */
  data: XOR<RateLimitCreateInput, RateLimitUncheckedCreateInput>;
};
/**
 * RateLimit createMany
 */
type RateLimitCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to create many RateLimits.
   */
  data: RateLimitCreateManyInput | RateLimitCreateManyInput[];
  skipDuplicates?: boolean;
};
/**
 * RateLimit createManyAndReturn
 */
type RateLimitCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelectCreateManyAndReturn<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * The data used to create many RateLimits.
   */
  data: RateLimitCreateManyInput | RateLimitCreateManyInput[];
  skipDuplicates?: boolean;
};
/**
 * RateLimit update
 */
type RateLimitUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * The data needed to update a RateLimit.
   */
  data: XOR<RateLimitUpdateInput, RateLimitUncheckedUpdateInput>;
  /**
   * Choose, which RateLimit to update.
   */
  where: RateLimitWhereUniqueInput;
};
/**
 * RateLimit updateMany
 */
type RateLimitUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to update RateLimits.
   */
  data: XOR<RateLimitUpdateManyMutationInput, RateLimitUncheckedUpdateManyInput>;
  /**
   * Filter which RateLimits to update
   */
  where?: RateLimitWhereInput;
  /**
   * Limit how many RateLimits to update.
   */
  limit?: number;
};
/**
 * RateLimit updateManyAndReturn
 */
type RateLimitUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelectUpdateManyAndReturn<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * The data used to update RateLimits.
   */
  data: XOR<RateLimitUpdateManyMutationInput, RateLimitUncheckedUpdateManyInput>;
  /**
   * Filter which RateLimits to update
   */
  where?: RateLimitWhereInput;
  /**
   * Limit how many RateLimits to update.
   */
  limit?: number;
};
/**
 * RateLimit upsert
 */
type RateLimitUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * The filter to search for the RateLimit to update in case it exists.
   */
  where: RateLimitWhereUniqueInput;
  /**
   * In case the RateLimit found by the `where` argument doesn't exist, create a new RateLimit with this data.
   */
  create: XOR<RateLimitCreateInput, RateLimitUncheckedCreateInput>;
  /**
   * In case the RateLimit was found with the provided `where` argument, update it with this data.
   */
  update: XOR<RateLimitUpdateInput, RateLimitUncheckedUpdateInput>;
};
/**
 * RateLimit delete
 */
type RateLimitDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
  /**
   * Filter which RateLimit to delete.
   */
  where: RateLimitWhereUniqueInput;
};
/**
 * RateLimit deleteMany
 */
type RateLimitDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which RateLimits to delete
   */
  where?: RateLimitWhereInput;
  /**
   * Limit how many RateLimits to delete.
   */
  limit?: number;
};
/**
 * RateLimit without action
 */
type RateLimitDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the RateLimit
   */
  select?: RateLimitSelect<ExtArgs> | null;
  /**
   * Omit specific fields from the RateLimit
   */
  omit?: RateLimitOmit<ExtArgs> | null;
};
//#endregion
//#region src/generated/prisma/commonInputTypes.d.ts
type StringFilter<$PrismaModel = never> = {
  equals?: string | StringFieldRefInput<$PrismaModel>;
  in?: string[] | ListStringFieldRefInput<$PrismaModel>;
  notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
  lt?: string | StringFieldRefInput<$PrismaModel>;
  lte?: string | StringFieldRefInput<$PrismaModel>;
  gt?: string | StringFieldRefInput<$PrismaModel>;
  gte?: string | StringFieldRefInput<$PrismaModel>;
  contains?: string | StringFieldRefInput<$PrismaModel>;
  startsWith?: string | StringFieldRefInput<$PrismaModel>;
  endsWith?: string | StringFieldRefInput<$PrismaModel>;
  mode?: QueryMode;
  not?: NestedStringFilter<$PrismaModel> | string;
};
type BoolFilter<$PrismaModel = never> = {
  equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
  not?: NestedBoolFilter<$PrismaModel> | boolean;
};
type StringNullableFilter<$PrismaModel = never> = {
  equals?: string | StringFieldRefInput<$PrismaModel> | null;
  in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
  notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
  lt?: string | StringFieldRefInput<$PrismaModel>;
  lte?: string | StringFieldRefInput<$PrismaModel>;
  gt?: string | StringFieldRefInput<$PrismaModel>;
  gte?: string | StringFieldRefInput<$PrismaModel>;
  contains?: string | StringFieldRefInput<$PrismaModel>;
  startsWith?: string | StringFieldRefInput<$PrismaModel>;
  endsWith?: string | StringFieldRefInput<$PrismaModel>;
  mode?: QueryMode;
  not?: NestedStringNullableFilter<$PrismaModel> | string | null;
};
type DateTimeFilter<$PrismaModel = never> = {
  equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
  notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
  lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
};
type SortOrderInput = {
  sort: SortOrder;
  nulls?: NullsOrder;
};
type StringWithAggregatesFilter<$PrismaModel = never> = {
  equals?: string | StringFieldRefInput<$PrismaModel>;
  in?: string[] | ListStringFieldRefInput<$PrismaModel>;
  notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
  lt?: string | StringFieldRefInput<$PrismaModel>;
  lte?: string | StringFieldRefInput<$PrismaModel>;
  gt?: string | StringFieldRefInput<$PrismaModel>;
  gte?: string | StringFieldRefInput<$PrismaModel>;
  contains?: string | StringFieldRefInput<$PrismaModel>;
  startsWith?: string | StringFieldRefInput<$PrismaModel>;
  endsWith?: string | StringFieldRefInput<$PrismaModel>;
  mode?: QueryMode;
  not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
  _count?: NestedIntFilter<$PrismaModel>;
  _min?: NestedStringFilter<$PrismaModel>;
  _max?: NestedStringFilter<$PrismaModel>;
};
type BoolWithAggregatesFilter<$PrismaModel = never> = {
  equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
  not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
  _count?: NestedIntFilter<$PrismaModel>;
  _min?: NestedBoolFilter<$PrismaModel>;
  _max?: NestedBoolFilter<$PrismaModel>;
};
type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
  equals?: string | StringFieldRefInput<$PrismaModel> | null;
  in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
  notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
  lt?: string | StringFieldRefInput<$PrismaModel>;
  lte?: string | StringFieldRefInput<$PrismaModel>;
  gt?: string | StringFieldRefInput<$PrismaModel>;
  gte?: string | StringFieldRefInput<$PrismaModel>;
  contains?: string | StringFieldRefInput<$PrismaModel>;
  startsWith?: string | StringFieldRefInput<$PrismaModel>;
  endsWith?: string | StringFieldRefInput<$PrismaModel>;
  mode?: QueryMode;
  not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
  _count?: NestedIntNullableFilter<$PrismaModel>;
  _min?: NestedStringNullableFilter<$PrismaModel>;
  _max?: NestedStringNullableFilter<$PrismaModel>;
};
type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
  equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
  notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
  lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
  _count?: NestedIntFilter<$PrismaModel>;
  _min?: NestedDateTimeFilter<$PrismaModel>;
  _max?: NestedDateTimeFilter<$PrismaModel>;
};
type DateTimeNullableFilter<$PrismaModel = never> = {
  equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
  in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
  notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
  lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
};
type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
  equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
  in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
  notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
  lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
  _count?: NestedIntNullableFilter<$PrismaModel>;
  _min?: NestedDateTimeNullableFilter<$PrismaModel>;
  _max?: NestedDateTimeNullableFilter<$PrismaModel>;
};
type IntFilter<$PrismaModel = never> = {
  equals?: number | IntFieldRefInput<$PrismaModel>;
  in?: number[] | ListIntFieldRefInput<$PrismaModel>;
  notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
  lt?: number | IntFieldRefInput<$PrismaModel>;
  lte?: number | IntFieldRefInput<$PrismaModel>;
  gt?: number | IntFieldRefInput<$PrismaModel>;
  gte?: number | IntFieldRefInput<$PrismaModel>;
  not?: NestedIntFilter<$PrismaModel> | number;
};
type BigIntFilter<$PrismaModel = never> = {
  equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
  notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
  lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  not?: NestedBigIntFilter<$PrismaModel> | bigint | number;
};
type IntWithAggregatesFilter<$PrismaModel = never> = {
  equals?: number | IntFieldRefInput<$PrismaModel>;
  in?: number[] | ListIntFieldRefInput<$PrismaModel>;
  notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
  lt?: number | IntFieldRefInput<$PrismaModel>;
  lte?: number | IntFieldRefInput<$PrismaModel>;
  gt?: number | IntFieldRefInput<$PrismaModel>;
  gte?: number | IntFieldRefInput<$PrismaModel>;
  not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
  _count?: NestedIntFilter<$PrismaModel>;
  _avg?: NestedFloatFilter<$PrismaModel>;
  _sum?: NestedIntFilter<$PrismaModel>;
  _min?: NestedIntFilter<$PrismaModel>;
  _max?: NestedIntFilter<$PrismaModel>;
};
type BigIntWithAggregatesFilter<$PrismaModel = never> = {
  equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
  notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
  lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number;
  _count?: NestedIntFilter<$PrismaModel>;
  _avg?: NestedFloatFilter<$PrismaModel>;
  _sum?: NestedBigIntFilter<$PrismaModel>;
  _min?: NestedBigIntFilter<$PrismaModel>;
  _max?: NestedBigIntFilter<$PrismaModel>;
};
type NestedStringFilter<$PrismaModel = never> = {
  equals?: string | StringFieldRefInput<$PrismaModel>;
  in?: string[] | ListStringFieldRefInput<$PrismaModel>;
  notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
  lt?: string | StringFieldRefInput<$PrismaModel>;
  lte?: string | StringFieldRefInput<$PrismaModel>;
  gt?: string | StringFieldRefInput<$PrismaModel>;
  gte?: string | StringFieldRefInput<$PrismaModel>;
  contains?: string | StringFieldRefInput<$PrismaModel>;
  startsWith?: string | StringFieldRefInput<$PrismaModel>;
  endsWith?: string | StringFieldRefInput<$PrismaModel>;
  not?: NestedStringFilter<$PrismaModel> | string;
};
type NestedBoolFilter<$PrismaModel = never> = {
  equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
  not?: NestedBoolFilter<$PrismaModel> | boolean;
};
type NestedStringNullableFilter<$PrismaModel = never> = {
  equals?: string | StringFieldRefInput<$PrismaModel> | null;
  in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
  notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
  lt?: string | StringFieldRefInput<$PrismaModel>;
  lte?: string | StringFieldRefInput<$PrismaModel>;
  gt?: string | StringFieldRefInput<$PrismaModel>;
  gte?: string | StringFieldRefInput<$PrismaModel>;
  contains?: string | StringFieldRefInput<$PrismaModel>;
  startsWith?: string | StringFieldRefInput<$PrismaModel>;
  endsWith?: string | StringFieldRefInput<$PrismaModel>;
  not?: NestedStringNullableFilter<$PrismaModel> | string | null;
};
type NestedDateTimeFilter<$PrismaModel = never> = {
  equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
  notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
  lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
};
type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
  equals?: string | StringFieldRefInput<$PrismaModel>;
  in?: string[] | ListStringFieldRefInput<$PrismaModel>;
  notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
  lt?: string | StringFieldRefInput<$PrismaModel>;
  lte?: string | StringFieldRefInput<$PrismaModel>;
  gt?: string | StringFieldRefInput<$PrismaModel>;
  gte?: string | StringFieldRefInput<$PrismaModel>;
  contains?: string | StringFieldRefInput<$PrismaModel>;
  startsWith?: string | StringFieldRefInput<$PrismaModel>;
  endsWith?: string | StringFieldRefInput<$PrismaModel>;
  not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
  _count?: NestedIntFilter<$PrismaModel>;
  _min?: NestedStringFilter<$PrismaModel>;
  _max?: NestedStringFilter<$PrismaModel>;
};
type NestedIntFilter<$PrismaModel = never> = {
  equals?: number | IntFieldRefInput<$PrismaModel>;
  in?: number[] | ListIntFieldRefInput<$PrismaModel>;
  notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
  lt?: number | IntFieldRefInput<$PrismaModel>;
  lte?: number | IntFieldRefInput<$PrismaModel>;
  gt?: number | IntFieldRefInput<$PrismaModel>;
  gte?: number | IntFieldRefInput<$PrismaModel>;
  not?: NestedIntFilter<$PrismaModel> | number;
};
type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
  equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
  not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
  _count?: NestedIntFilter<$PrismaModel>;
  _min?: NestedBoolFilter<$PrismaModel>;
  _max?: NestedBoolFilter<$PrismaModel>;
};
type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
  equals?: string | StringFieldRefInput<$PrismaModel> | null;
  in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
  notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
  lt?: string | StringFieldRefInput<$PrismaModel>;
  lte?: string | StringFieldRefInput<$PrismaModel>;
  gt?: string | StringFieldRefInput<$PrismaModel>;
  gte?: string | StringFieldRefInput<$PrismaModel>;
  contains?: string | StringFieldRefInput<$PrismaModel>;
  startsWith?: string | StringFieldRefInput<$PrismaModel>;
  endsWith?: string | StringFieldRefInput<$PrismaModel>;
  not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
  _count?: NestedIntNullableFilter<$PrismaModel>;
  _min?: NestedStringNullableFilter<$PrismaModel>;
  _max?: NestedStringNullableFilter<$PrismaModel>;
};
type NestedIntNullableFilter<$PrismaModel = never> = {
  equals?: number | IntFieldRefInput<$PrismaModel> | null;
  in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
  notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
  lt?: number | IntFieldRefInput<$PrismaModel>;
  lte?: number | IntFieldRefInput<$PrismaModel>;
  gt?: number | IntFieldRefInput<$PrismaModel>;
  gte?: number | IntFieldRefInput<$PrismaModel>;
  not?: NestedIntNullableFilter<$PrismaModel> | number | null;
};
type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
  equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
  notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
  lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
  _count?: NestedIntFilter<$PrismaModel>;
  _min?: NestedDateTimeFilter<$PrismaModel>;
  _max?: NestedDateTimeFilter<$PrismaModel>;
};
type NestedDateTimeNullableFilter<$PrismaModel = never> = {
  equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
  in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
  notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
  lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
};
type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
  equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
  in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
  notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null;
  lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
  not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
  _count?: NestedIntNullableFilter<$PrismaModel>;
  _min?: NestedDateTimeNullableFilter<$PrismaModel>;
  _max?: NestedDateTimeNullableFilter<$PrismaModel>;
};
type NestedBigIntFilter<$PrismaModel = never> = {
  equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
  notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
  lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  not?: NestedBigIntFilter<$PrismaModel> | bigint | number;
};
type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
  equals?: number | IntFieldRefInput<$PrismaModel>;
  in?: number[] | ListIntFieldRefInput<$PrismaModel>;
  notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
  lt?: number | IntFieldRefInput<$PrismaModel>;
  lte?: number | IntFieldRefInput<$PrismaModel>;
  gt?: number | IntFieldRefInput<$PrismaModel>;
  gte?: number | IntFieldRefInput<$PrismaModel>;
  not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
  _count?: NestedIntFilter<$PrismaModel>;
  _avg?: NestedFloatFilter<$PrismaModel>;
  _sum?: NestedIntFilter<$PrismaModel>;
  _min?: NestedIntFilter<$PrismaModel>;
  _max?: NestedIntFilter<$PrismaModel>;
};
type NestedFloatFilter<$PrismaModel = never> = {
  equals?: number | FloatFieldRefInput<$PrismaModel>;
  in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
  notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
  lt?: number | FloatFieldRefInput<$PrismaModel>;
  lte?: number | FloatFieldRefInput<$PrismaModel>;
  gt?: number | FloatFieldRefInput<$PrismaModel>;
  gte?: number | FloatFieldRefInput<$PrismaModel>;
  not?: NestedFloatFilter<$PrismaModel> | number;
};
type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
  equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
  notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
  lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
  not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number;
  _count?: NestedIntFilter<$PrismaModel>;
  _avg?: NestedFloatFilter<$PrismaModel>;
  _sum?: NestedBigIntFilter<$PrismaModel>;
  _min?: NestedBigIntFilter<$PrismaModel>;
  _max?: NestedBigIntFilter<$PrismaModel>;
};
declare namespace prismaNamespace_d_exports {
  export { $AccountPayload, $RateLimitPayload, $SessionPayload, $UserPayload, $VerificationPayload, AccountAggregateArgs, AccountCountAggregateInputType, AccountCountAggregateOutputType, AccountCountArgs, AccountCountOrderByAggregateInput, AccountCreateArgs, AccountCreateInput, AccountCreateManyAndReturnArgs, AccountCreateManyArgs, AccountCreateManyInput, AccountCreateManyUserInput, AccountCreateManyUserInputEnvelope, AccountCreateNestedManyWithoutUserInput, AccountCreateOrConnectWithoutUserInput, AccountCreateWithoutUserInput, AccountDefaultArgs, AccountDelegate, AccountDeleteArgs, AccountDeleteManyArgs, AccountFieldRefs, AccountFindFirstArgs, AccountFindFirstOrThrowArgs, AccountFindManyArgs, AccountFindUniqueArgs, AccountFindUniqueOrThrowArgs, AccountGetPayload, AccountGroupByArgs, AccountGroupByOutputType, AccountInclude, AccountIncludeCreateManyAndReturn, AccountIncludeUpdateManyAndReturn, AccountListRelationFilter, AccountMaxAggregateInputType, AccountMaxAggregateOutputType, AccountMaxOrderByAggregateInput, AccountMinAggregateInputType, AccountMinAggregateOutputType, AccountMinOrderByAggregateInput, AccountModel, AccountOmit, AccountOrderByRelationAggregateInput, AccountOrderByWithAggregationInput, AccountOrderByWithRelationInput, AccountProviderIdAccountIdCompoundUniqueInput, AccountScalarFieldEnum, AccountScalarWhereInput, AccountScalarWhereWithAggregatesInput, AccountSelect, AccountSelectCreateManyAndReturn, AccountSelectScalar, AccountSelectUpdateManyAndReturn, AccountUncheckedCreateInput, AccountUncheckedCreateNestedManyWithoutUserInput, AccountUncheckedCreateWithoutUserInput, AccountUncheckedUpdateInput, AccountUncheckedUpdateManyInput, AccountUncheckedUpdateManyWithoutUserInput, AccountUncheckedUpdateManyWithoutUserNestedInput, AccountUncheckedUpdateWithoutUserInput, AccountUpdateArgs, AccountUpdateInput, AccountUpdateManyAndReturnArgs, AccountUpdateManyArgs, AccountUpdateManyMutationInput, AccountUpdateManyWithWhereWithoutUserInput, AccountUpdateManyWithoutUserNestedInput, AccountUpdateWithWhereUniqueWithoutUserInput, AccountUpdateWithoutUserInput, AccountUpsertArgs, AccountUpsertWithWhereUniqueWithoutUserInput, AccountWhereInput, AccountWhereUniqueInput, AggregateAccount, AggregateRateLimit, AggregateSession, AggregateUser, AggregateVerification, AnyNull, Args, At, AtLeast, BatchPayload, BigIntFieldRefInput, BigIntFieldUpdateOperationsInput, BigIntFilter, BigIntWithAggregatesFilter, BoolFieldUpdateOperationsInput, BoolFilter, BoolWithAggregatesFilter, Boolean, BooleanFieldRefInput, Bytes, CheckIsLogLevel, ComputeRaw, DMMF, DateTimeFieldRefInput, DateTimeFieldUpdateOperationsInput, DateTimeFilter, DateTimeNullableFilter, DateTimeNullableWithAggregatesFilter, DateTimeWithAggregatesFilter, DbNull, Decimal, DecimalJsLike, DefaultPrismaClient, Either, Enumerable, ErrorFormat, Exact, ExcludeUnderscoreKeys, Extends, Extension, False, FieldRef, FloatFieldRefInput, GetAccountAggregateType, GetAccountGroupByPayload, GetEvents, GetHavingFields, GetLogType, GetRateLimitAggregateType, GetRateLimitGroupByPayload, GetScalarType, GetSessionAggregateType, GetSessionGroupByPayload, GetUserAggregateType, GetUserGroupByPayload, GetVerificationAggregateType, GetVerificationGroupByPayload, GlobalOmitConfig, Has, InputJsonArray, InputJsonObject, InputJsonValue, IntFieldRefInput, IntFieldUpdateOperationsInput, IntFilter, IntWithAggregatesFilter, IntersectOf, JsonArray, JsonNull, JsonObject, JsonValue, Keys, ListBigIntFieldRefInput, ListDateTimeFieldRefInput, ListFloatFieldRefInput, ListIntFieldRefInput, ListStringFieldRefInput, LogDefinition, LogEvent, LogLevel, MaybeTupleToUnion, Merge, ModelName, NestedBigIntFilter, NestedBigIntWithAggregatesFilter, NestedBoolFilter, NestedBoolWithAggregatesFilter, NestedDateTimeFilter, NestedDateTimeNullableFilter, NestedDateTimeNullableWithAggregatesFilter, NestedDateTimeWithAggregatesFilter, NestedFloatFilter, NestedIntFilter, NestedIntNullableFilter, NestedIntWithAggregatesFilter, NestedStringFilter, NestedStringNullableFilter, NestedStringNullableWithAggregatesFilter, NestedStringWithAggregatesFilter, Not, NullTypes, NullableDateTimeFieldUpdateOperationsInput, NullableStringFieldUpdateOperationsInput, NullsOrder, OptionalFlat, Or, Overwrite, PatchUndefined, Payload, PickEnumerable, PrismaAction, PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientOptions, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError, PrismaPromise, PrismaVersion, Prisma__AccountClient, Prisma__RateLimitClient, Prisma__SessionClient, Prisma__UserClient, Prisma__VerificationClient, QueryEvent, QueryMode, RateLimitAggregateArgs, RateLimitAvgAggregateInputType, RateLimitAvgAggregateOutputType, RateLimitAvgOrderByAggregateInput, RateLimitCountAggregateInputType, RateLimitCountAggregateOutputType, RateLimitCountArgs, RateLimitCountOrderByAggregateInput, RateLimitCreateArgs, RateLimitCreateInput, RateLimitCreateManyAndReturnArgs, RateLimitCreateManyArgs, RateLimitCreateManyInput, RateLimitDefaultArgs, RateLimitDelegate, RateLimitDeleteArgs, RateLimitDeleteManyArgs, RateLimitFieldRefs, RateLimitFindFirstArgs, RateLimitFindFirstOrThrowArgs, RateLimitFindManyArgs, RateLimitFindUniqueArgs, RateLimitFindUniqueOrThrowArgs, RateLimitGetPayload, RateLimitGroupByArgs, RateLimitGroupByOutputType, RateLimitMaxAggregateInputType, RateLimitMaxAggregateOutputType, RateLimitMaxOrderByAggregateInput, RateLimitMinAggregateInputType, RateLimitMinAggregateOutputType, RateLimitMinOrderByAggregateInput, RateLimitModel, RateLimitOmit, RateLimitOrderByWithAggregationInput, RateLimitOrderByWithRelationInput, RateLimitScalarFieldEnum, RateLimitScalarWhereWithAggregatesInput, RateLimitSelect, RateLimitSelectCreateManyAndReturn, RateLimitSelectScalar, RateLimitSelectUpdateManyAndReturn, RateLimitSumAggregateInputType, RateLimitSumAggregateOutputType, RateLimitSumOrderByAggregateInput, RateLimitUncheckedCreateInput, RateLimitUncheckedUpdateInput, RateLimitUncheckedUpdateManyInput, RateLimitUpdateArgs, RateLimitUpdateInput, RateLimitUpdateManyAndReturnArgs, RateLimitUpdateManyArgs, RateLimitUpdateManyMutationInput, RateLimitUpsertArgs, RateLimitWhereInput, RateLimitWhereUniqueInput, Result, SelectSubset, SessionAggregateArgs, SessionCountAggregateInputType, SessionCountAggregateOutputType, SessionCountArgs, SessionCountOrderByAggregateInput, SessionCreateArgs, SessionCreateInput, SessionCreateManyAndReturnArgs, SessionCreateManyArgs, SessionCreateManyInput, SessionCreateManyUserInput, SessionCreateManyUserInputEnvelope, SessionCreateNestedManyWithoutUserInput, SessionCreateOrConnectWithoutUserInput, SessionCreateWithoutUserInput, SessionDefaultArgs, SessionDelegate, SessionDeleteArgs, SessionDeleteManyArgs, SessionFieldRefs, SessionFindFirstArgs, SessionFindFirstOrThrowArgs, SessionFindManyArgs, SessionFindUniqueArgs, SessionFindUniqueOrThrowArgs, SessionGetPayload, SessionGroupByArgs, SessionGroupByOutputType, SessionInclude, SessionIncludeCreateManyAndReturn, SessionIncludeUpdateManyAndReturn, SessionListRelationFilter, SessionMaxAggregateInputType, SessionMaxAggregateOutputType, SessionMaxOrderByAggregateInput, SessionMinAggregateInputType, SessionMinAggregateOutputType, SessionMinOrderByAggregateInput, SessionModel, SessionOmit, SessionOrderByRelationAggregateInput, SessionOrderByWithAggregationInput, SessionOrderByWithRelationInput, SessionScalarFieldEnum, SessionScalarWhereInput, SessionScalarWhereWithAggregatesInput, SessionSelect, SessionSelectCreateManyAndReturn, SessionSelectScalar, SessionSelectUpdateManyAndReturn, SessionUncheckedCreateInput, SessionUncheckedCreateNestedManyWithoutUserInput, SessionUncheckedCreateWithoutUserInput, SessionUncheckedUpdateInput, SessionUncheckedUpdateManyInput, SessionUncheckedUpdateManyWithoutUserInput, SessionUncheckedUpdateManyWithoutUserNestedInput, SessionUncheckedUpdateWithoutUserInput, SessionUpdateArgs, SessionUpdateInput, SessionUpdateManyAndReturnArgs, SessionUpdateManyArgs, SessionUpdateManyMutationInput, SessionUpdateManyWithWhereWithoutUserInput, SessionUpdateManyWithoutUserNestedInput, SessionUpdateWithWhereUniqueWithoutUserInput, SessionUpdateWithoutUserInput, SessionUpsertArgs, SessionUpsertWithWhereUniqueWithoutUserInput, SessionWhereInput, SessionWhereUniqueInput, SortOrder, SortOrderInput, Sql, Strict, StringFieldRefInput, StringFieldUpdateOperationsInput, StringFilter, StringNullableFilter, StringNullableWithAggregatesFilter, StringWithAggregatesFilter, Subset, SubsetIntersection, TransactionClient, TransactionIsolationLevel, True, TypeMap, TypeMapCb, UnEnumerate, Union, User$accountsArgs, User$sessionsArgs, UserAggregateArgs, UserCountAggregateInputType, UserCountAggregateOutputType, UserCountArgs, UserCountOrderByAggregateInput, UserCountOutputType, UserCountOutputTypeCountAccountsArgs, UserCountOutputTypeCountSessionsArgs, UserCountOutputTypeDefaultArgs, UserCountOutputTypeSelect, UserCreateArgs, UserCreateInput, UserCreateManyAndReturnArgs, UserCreateManyArgs, UserCreateManyInput, UserCreateNestedOneWithoutAccountsInput, UserCreateNestedOneWithoutSessionsInput, UserCreateOrConnectWithoutAccountsInput, UserCreateOrConnectWithoutSessionsInput, UserCreateWithoutAccountsInput, UserCreateWithoutSessionsInput, UserDefaultArgs, UserDelegate, UserDeleteArgs, UserDeleteManyArgs, UserFieldRefs, UserFindFirstArgs, UserFindFirstOrThrowArgs, UserFindManyArgs, UserFindUniqueArgs, UserFindUniqueOrThrowArgs, UserGetPayload, UserGroupByArgs, UserGroupByOutputType, UserInclude, UserIncludeCreateManyAndReturn, UserIncludeUpdateManyAndReturn, UserMaxAggregateInputType, UserMaxAggregateOutputType, UserMaxOrderByAggregateInput, UserMinAggregateInputType, UserMinAggregateOutputType, UserMinOrderByAggregateInput, UserModel, UserOmit, UserOrderByWithAggregationInput, UserOrderByWithRelationInput, UserScalarFieldEnum, UserScalarRelationFilter, UserScalarWhereWithAggregatesInput, UserSelect, UserSelectCreateManyAndReturn, UserSelectScalar, UserSelectUpdateManyAndReturn, UserUncheckedCreateInput, UserUncheckedCreateWithoutAccountsInput, UserUncheckedCreateWithoutSessionsInput, UserUncheckedUpdateInput, UserUncheckedUpdateManyInput, UserUncheckedUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutSessionsInput, UserUpdateArgs, UserUpdateInput, UserUpdateManyAndReturnArgs, UserUpdateManyArgs, UserUpdateManyMutationInput, UserUpdateOneRequiredWithoutAccountsNestedInput, UserUpdateOneRequiredWithoutSessionsNestedInput, UserUpdateToOneWithWhereWithoutAccountsInput, UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutAccountsInput, UserUpdateWithoutSessionsInput, UserUpsertArgs, UserUpsertWithoutAccountsInput, UserUpsertWithoutSessionsInput, UserWhereInput, UserWhereUniqueInput, VerificationAggregateArgs, VerificationCountAggregateInputType, VerificationCountAggregateOutputType, VerificationCountArgs, VerificationCountOrderByAggregateInput, VerificationCreateArgs, VerificationCreateInput, VerificationCreateManyAndReturnArgs, VerificationCreateManyArgs, VerificationCreateManyInput, VerificationDefaultArgs, VerificationDelegate, VerificationDeleteArgs, VerificationDeleteManyArgs, VerificationFieldRefs, VerificationFindFirstArgs, VerificationFindFirstOrThrowArgs, VerificationFindManyArgs, VerificationFindUniqueArgs, VerificationFindUniqueOrThrowArgs, VerificationGetPayload, VerificationGroupByArgs, VerificationGroupByOutputType, VerificationIdentifierValueCompoundUniqueInput, VerificationMaxAggregateInputType, VerificationMaxAggregateOutputType, VerificationMaxOrderByAggregateInput, VerificationMinAggregateInputType, VerificationMinAggregateOutputType, VerificationMinOrderByAggregateInput, VerificationModel, VerificationOmit, VerificationOrderByWithAggregationInput, VerificationOrderByWithRelationInput, VerificationScalarFieldEnum, VerificationScalarWhereWithAggregatesInput, VerificationSelect, VerificationSelectCreateManyAndReturn, VerificationSelectScalar, VerificationSelectUpdateManyAndReturn, VerificationUncheckedCreateInput, VerificationUncheckedUpdateInput, VerificationUncheckedUpdateManyInput, VerificationUpdateArgs, VerificationUpdateInput, VerificationUpdateManyAndReturnArgs, VerificationUpdateManyArgs, VerificationUpdateManyMutationInput, VerificationUpsertArgs, VerificationWhereInput, VerificationWhereUniqueInput, XOR, defineExtension, empty, getExtensionContext, join, prismaVersion, raw, sql };
}
type DMMF = typeof runtime.DMMF;
type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
/**
 * Prisma Errors
 */
declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
type PrismaClientValidationError = runtime.PrismaClientValidationError;
/**
 * Re-export of sql-template-tag
 */
declare const sql: typeof runtime.sqltag;
declare const empty: runtime.Sql;
declare const join: typeof runtime.join;
declare const raw: typeof runtime.raw;
declare const Sql: typeof runtime.Sql;
type Sql = runtime.Sql;
/**
 * Decimal.js
 */
declare const Decimal: typeof runtime.Decimal;
type Decimal = runtime.Decimal;
type DecimalJsLike = runtime.DecimalJsLike;
/**
* Extensions
*/
type Extension = runtime.Types.Extensions.UserArgs;
declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
type PrismaVersion = {
  client: string;
  engine: string;
};
/**
 * Prisma Client JS version: 7.8.0
 * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
 */
declare const prismaVersion: PrismaVersion;
/**
 * Utility Types
 */
type Bytes = runtime.Bytes;
type JsonObject = runtime.JsonObject;
type JsonArray = runtime.JsonArray;
type JsonValue = runtime.JsonValue;
type InputJsonObject = runtime.InputJsonObject;
type InputJsonArray = runtime.InputJsonArray;
type InputJsonValue = runtime.InputJsonValue;
declare const NullTypes: {
  DbNull: (new (secret: never) => typeof runtime.DbNull);
  JsonNull: (new (secret: never) => typeof runtime.JsonNull);
  AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
declare const DbNull: runtime.DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
declare const JsonNull: runtime.JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
  select: any;
  include: any;
};
type SelectAndOmit = {
  select: any;
  omit: any;
};
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Prisma__Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Enumerable<T> = T | Array<T>;
/**
 * Subset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
 */
type Subset<T, U> = { [key in keyof T]: key extends keyof U ? T[key] : never };
/**
 * SelectSubset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
 * Additionally, it validates, if both select and include are present. If the case, it errors.
 */
type SelectSubset<T, U> = { [key in keyof T]: key extends keyof U ? T[key] : never } & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
/**
 * Subset + Intersection
 * @desc From `T` pick properties that exist in `U` and intersect `K`
 */
type SubsetIntersection<T, U, K> = { [key in keyof T]: key extends keyof U ? T[key] : never } & K;
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
/**
 * XOR is needed to have a real mutually exclusive union type
 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
 */
type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
/**
 * Is T a Record?
 */
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
/**
 * If it's T[], return T
 */
type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
/**
 * From ts-toolbelt
 */
type __Either<O extends object, K extends Key> = Omit<O, K> & { [P in K]: Prisma__Pick<O, P & keyof O> }[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
  1: EitherStrict<O, K>;
  0: EitherLoose<O, K>;
}[strict];
type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
type Union = any;
type PatchUndefined<O extends object, O1 extends object> = { [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K] } & {};
/** Helper Types for "Merge" **/
type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type Overwrite<O extends object, O1 extends object> = { [K in keyof O]: K extends keyof O1 ? O1[K] : O[K] } & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, { [K in keyof U]-?: At<U, K> }>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
type At<O extends object, K extends Key, strict extends Boolean = 1> = {
  1: AtStrict<O, K>;
  0: AtLoose<O, K>;
}[strict];
type ComputeRaw<A extends any> = A extends Function ? A : { [K in keyof A]: A[K] } & {};
type OptionalFlat<O> = { [K in keyof O]?: O[K] } & {};
type _Record<K extends keyof any, T> = { [P in K]: T };
type NoExpand<T> = T extends unknown ? T : never;
type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? { [P in K]: O[P] } & O : O) | { [P in keyof O as P extends K ? P : never]-?: O[P] } & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
type Strict<U extends object> = ComputeRaw<_Strict<U>>;
/** End Helper Types for "Merge" **/
type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
type Boolean = True | False;
type True = 1;
type False = 0;
type Not<B extends Boolean> = {
  0: 1;
  1: 0;
}[B];
type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
type Or<B1 extends Boolean, B2 extends Boolean> = {
  0: {
    0: 0;
    1: 1;
  };
  1: {
    0: 1;
    1: 1;
  };
}[B1][B2];
type Keys<U extends Union> = U extends unknown ? keyof U : never;
type GetScalarType<T, O> = O extends object ? { [P in keyof T]: P extends keyof O ? O[P] : never } : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
type GetHavingFields<T> = { [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K }[keyof T];
/**
 * Convert tuple to union
 */
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
/**
 * Like `Pick`, but additionally can also accept an array of keys
 */
type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
/**
 * Exclude all keys with underscores
 */
type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
declare const ModelName: {
  readonly User: "User";
  readonly Session: "Session";
  readonly Account: "Account";
  readonly Verification: "Verification";
  readonly RateLimit: "RateLimit";
};
type ModelName = (typeof ModelName)[keyof typeof ModelName];
interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
  extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
  returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
  globalOmitOptions: {
    omit: GlobalOmitOptions;
  };
  meta: {
    modelProps: "user" | "session" | "account" | "verification" | "rateLimit";
    txIsolationLevel: TransactionIsolationLevel;
  };
  model: {
    User: {
      payload: $UserPayload<ExtArgs>;
      fields: UserFieldRefs;
      operations: {
        findUnique: {
          args: UserFindUniqueArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload> | null;
        };
        findUniqueOrThrow: {
          args: UserFindUniqueOrThrowArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload>;
        };
        findFirst: {
          args: UserFindFirstArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload> | null;
        };
        findFirstOrThrow: {
          args: UserFindFirstOrThrowArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload>;
        };
        findMany: {
          args: UserFindManyArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload>[];
        };
        create: {
          args: UserCreateArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload>;
        };
        createMany: {
          args: UserCreateManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        createManyAndReturn: {
          args: UserCreateManyAndReturnArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload>[];
        };
        delete: {
          args: UserDeleteArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload>;
        };
        update: {
          args: UserUpdateArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload>;
        };
        deleteMany: {
          args: UserDeleteManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        updateMany: {
          args: UserUpdateManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        updateManyAndReturn: {
          args: UserUpdateManyAndReturnArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload>[];
        };
        upsert: {
          args: UserUpsertArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$UserPayload>;
        };
        aggregate: {
          args: UserAggregateArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<AggregateUser>;
        };
        groupBy: {
          args: UserGroupByArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<UserGroupByOutputType>[];
        };
        count: {
          args: UserCountArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<UserCountAggregateOutputType> | number;
        };
      };
    };
    Session: {
      payload: $SessionPayload<ExtArgs>;
      fields: SessionFieldRefs;
      operations: {
        findUnique: {
          args: SessionFindUniqueArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload> | null;
        };
        findUniqueOrThrow: {
          args: SessionFindUniqueOrThrowArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload>;
        };
        findFirst: {
          args: SessionFindFirstArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload> | null;
        };
        findFirstOrThrow: {
          args: SessionFindFirstOrThrowArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload>;
        };
        findMany: {
          args: SessionFindManyArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload>[];
        };
        create: {
          args: SessionCreateArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload>;
        };
        createMany: {
          args: SessionCreateManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        createManyAndReturn: {
          args: SessionCreateManyAndReturnArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload>[];
        };
        delete: {
          args: SessionDeleteArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload>;
        };
        update: {
          args: SessionUpdateArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload>;
        };
        deleteMany: {
          args: SessionDeleteManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        updateMany: {
          args: SessionUpdateManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        updateManyAndReturn: {
          args: SessionUpdateManyAndReturnArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload>[];
        };
        upsert: {
          args: SessionUpsertArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$SessionPayload>;
        };
        aggregate: {
          args: SessionAggregateArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<AggregateSession>;
        };
        groupBy: {
          args: SessionGroupByArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<SessionGroupByOutputType>[];
        };
        count: {
          args: SessionCountArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<SessionCountAggregateOutputType> | number;
        };
      };
    };
    Account: {
      payload: $AccountPayload<ExtArgs>;
      fields: AccountFieldRefs;
      operations: {
        findUnique: {
          args: AccountFindUniqueArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload> | null;
        };
        findUniqueOrThrow: {
          args: AccountFindUniqueOrThrowArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload>;
        };
        findFirst: {
          args: AccountFindFirstArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload> | null;
        };
        findFirstOrThrow: {
          args: AccountFindFirstOrThrowArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload>;
        };
        findMany: {
          args: AccountFindManyArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload>[];
        };
        create: {
          args: AccountCreateArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload>;
        };
        createMany: {
          args: AccountCreateManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        createManyAndReturn: {
          args: AccountCreateManyAndReturnArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload>[];
        };
        delete: {
          args: AccountDeleteArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload>;
        };
        update: {
          args: AccountUpdateArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload>;
        };
        deleteMany: {
          args: AccountDeleteManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        updateMany: {
          args: AccountUpdateManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        updateManyAndReturn: {
          args: AccountUpdateManyAndReturnArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload>[];
        };
        upsert: {
          args: AccountUpsertArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$AccountPayload>;
        };
        aggregate: {
          args: AccountAggregateArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<AggregateAccount>;
        };
        groupBy: {
          args: AccountGroupByArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<AccountGroupByOutputType>[];
        };
        count: {
          args: AccountCountArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<AccountCountAggregateOutputType> | number;
        };
      };
    };
    Verification: {
      payload: $VerificationPayload<ExtArgs>;
      fields: VerificationFieldRefs;
      operations: {
        findUnique: {
          args: VerificationFindUniqueArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload> | null;
        };
        findUniqueOrThrow: {
          args: VerificationFindUniqueOrThrowArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload>;
        };
        findFirst: {
          args: VerificationFindFirstArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload> | null;
        };
        findFirstOrThrow: {
          args: VerificationFindFirstOrThrowArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload>;
        };
        findMany: {
          args: VerificationFindManyArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload>[];
        };
        create: {
          args: VerificationCreateArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload>;
        };
        createMany: {
          args: VerificationCreateManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        createManyAndReturn: {
          args: VerificationCreateManyAndReturnArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload>[];
        };
        delete: {
          args: VerificationDeleteArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload>;
        };
        update: {
          args: VerificationUpdateArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload>;
        };
        deleteMany: {
          args: VerificationDeleteManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        updateMany: {
          args: VerificationUpdateManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        updateManyAndReturn: {
          args: VerificationUpdateManyAndReturnArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload>[];
        };
        upsert: {
          args: VerificationUpsertArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$VerificationPayload>;
        };
        aggregate: {
          args: VerificationAggregateArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<AggregateVerification>;
        };
        groupBy: {
          args: VerificationGroupByArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<VerificationGroupByOutputType>[];
        };
        count: {
          args: VerificationCountArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<VerificationCountAggregateOutputType> | number;
        };
      };
    };
    RateLimit: {
      payload: $RateLimitPayload<ExtArgs>;
      fields: RateLimitFieldRefs;
      operations: {
        findUnique: {
          args: RateLimitFindUniqueArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload> | null;
        };
        findUniqueOrThrow: {
          args: RateLimitFindUniqueOrThrowArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload>;
        };
        findFirst: {
          args: RateLimitFindFirstArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload> | null;
        };
        findFirstOrThrow: {
          args: RateLimitFindFirstOrThrowArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload>;
        };
        findMany: {
          args: RateLimitFindManyArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload>[];
        };
        create: {
          args: RateLimitCreateArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload>;
        };
        createMany: {
          args: RateLimitCreateManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        createManyAndReturn: {
          args: RateLimitCreateManyAndReturnArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload>[];
        };
        delete: {
          args: RateLimitDeleteArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload>;
        };
        update: {
          args: RateLimitUpdateArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload>;
        };
        deleteMany: {
          args: RateLimitDeleteManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        updateMany: {
          args: RateLimitUpdateManyArgs<ExtArgs>;
          result: BatchPayload;
        };
        updateManyAndReturn: {
          args: RateLimitUpdateManyAndReturnArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload>[];
        };
        upsert: {
          args: RateLimitUpsertArgs<ExtArgs>;
          result: runtime.Types.Utils.PayloadToResult<$RateLimitPayload>;
        };
        aggregate: {
          args: RateLimitAggregateArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<AggregateRateLimit>;
        };
        groupBy: {
          args: RateLimitGroupByArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<RateLimitGroupByOutputType>[];
        };
        count: {
          args: RateLimitCountArgs<ExtArgs>;
          result: runtime.Types.Utils.Optional<RateLimitCountAggregateOutputType> | number;
        };
      };
    };
  };
} & {
  other: {
    payload: any;
    operations: {
      $executeRaw: {
        args: [query: TemplateStringsArray | Sql, ...values: any[]];
        result: any;
      };
      $executeRawUnsafe: {
        args: [query: string, ...values: any[]];
        result: any;
      };
      $queryRaw: {
        args: [query: TemplateStringsArray | Sql, ...values: any[]];
        result: any;
      };
      $queryRawUnsafe: {
        args: [query: string, ...values: any[]];
        result: any;
      };
    };
  };
};
/**
 * Enums
 */
declare const TransactionIsolationLevel: {
  readonly ReadUncommitted: "ReadUncommitted";
  readonly ReadCommitted: "ReadCommitted";
  readonly RepeatableRead: "RepeatableRead";
  readonly Serializable: "Serializable";
};
type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
declare const UserScalarFieldEnum: {
  readonly id: "id";
  readonly email: "email";
  readonly emailVerified: "emailVerified";
  readonly name: "name";
  readonly image: "image";
  readonly createdAt: "createdAt";
  readonly updatedAt: "updatedAt";
  readonly username: "username";
  readonly displayUsername: "displayUsername";
  readonly displayName: "displayName";
};
type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
declare const SessionScalarFieldEnum: {
  readonly id: "id";
  readonly expiresAt: "expiresAt";
  readonly token: "token";
  readonly createdAt: "createdAt";
  readonly updatedAt: "updatedAt";
  readonly ipAddress: "ipAddress";
  readonly userAgent: "userAgent";
  readonly userId: "userId";
};
type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum];
declare const AccountScalarFieldEnum: {
  readonly id: "id";
  readonly accountId: "accountId";
  readonly providerId: "providerId";
  readonly userId: "userId";
  readonly accessToken: "accessToken";
  readonly refreshToken: "refreshToken";
  readonly idToken: "idToken";
  readonly accessTokenExpiresAt: "accessTokenExpiresAt";
  readonly refreshTokenExpiresAt: "refreshTokenExpiresAt";
  readonly scope: "scope";
  readonly password: "password";
  readonly createdAt: "createdAt";
  readonly updatedAt: "updatedAt";
};
type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum];
declare const VerificationScalarFieldEnum: {
  readonly id: "id";
  readonly identifier: "identifier";
  readonly value: "value";
  readonly expiresAt: "expiresAt";
  readonly createdAt: "createdAt";
  readonly updatedAt: "updatedAt";
};
type VerificationScalarFieldEnum = (typeof VerificationScalarFieldEnum)[keyof typeof VerificationScalarFieldEnum];
declare const RateLimitScalarFieldEnum: {
  readonly id: "id";
  readonly key: "key";
  readonly count: "count";
  readonly lastRequest: "lastRequest";
};
type RateLimitScalarFieldEnum = (typeof RateLimitScalarFieldEnum)[keyof typeof RateLimitScalarFieldEnum];
declare const SortOrder: {
  readonly asc: "asc";
  readonly desc: "desc";
};
type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
declare const QueryMode: {
  readonly default: "default";
  readonly insensitive: "insensitive";
};
type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
declare const NullsOrder: {
  readonly first: "first";
  readonly last: "last";
};
type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
/**
 * Field references
 */
/**
 * Reference to a field of type 'String'
 */
type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
/**
 * Reference to a field of type 'String[]'
 */
type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
/**
 * Reference to a field of type 'Boolean'
 */
type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
/**
 * Reference to a field of type 'DateTime'
 */
type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
/**
 * Reference to a field of type 'DateTime[]'
 */
type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
/**
 * Reference to a field of type 'Int'
 */
type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
/**
 * Reference to a field of type 'Int[]'
 */
type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
/**
 * Reference to a field of type 'BigInt'
 */
type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>;
/**
 * Reference to a field of type 'BigInt[]'
 */
type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>;
/**
 * Reference to a field of type 'Float'
 */
type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
/**
 * Reference to a field of type 'Float[]'
 */
type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
/**
 * Batch Payload for updateMany & deleteMany & createMany
 */
type BatchPayload = {
  count: number;
};
declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
type DefaultPrismaClient = PrismaClient$1;
type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
type PrismaClientOptions = ({
  /**
   * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-pg`.
   */
  adapter: runtime.SqlDriverAdapterFactory;
  accelerateUrl?: never;
} | {
  /**
   * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
   */
  accelerateUrl: string;
  adapter?: never;
}) & {
  /**
   * @default "colorless"
   */
  errorFormat?: ErrorFormat;
  /**
   * @example
   * ```
   * // Shorthand for `emit: 'stdout'`
   * log: ['query', 'info', 'warn', 'error']
   *
   * // Emit as events only
   * log: [
   *   { emit: 'event', level: 'query' },
   *   { emit: 'event', level: 'info' },
   *   { emit: 'event', level: 'warn' }
   *   { emit: 'event', level: 'error' }
   * ]
   *
   * / Emit as events and log to stdout
   * og: [
   *  { emit: 'stdout', level: 'query' },
   *  { emit: 'stdout', level: 'info' },
   *  { emit: 'stdout', level: 'warn' }
   *  { emit: 'stdout', level: 'error' }
   *
   * ```
   * Read more in our [docs](https://pris.ly/d/logging).
   */
  log?: (LogLevel | LogDefinition)[];
  /**
   * The default values for transactionOptions
   * maxWait ?= 2000
   * timeout ?= 5000
   */
  transactionOptions?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: TransactionIsolationLevel;
  };
  /**
   * Global configuration for omitting model fields by default.
   *
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   omit: {
   *     user: {
   *       password: true
   *     }
   *   }
   * })
   * ```
   */
  omit?: GlobalOmitConfig;
  /**
   * SQL commenter plugins that add metadata to SQL queries as comments.
   * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
   *
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter,
   *   comments: [
   *     traceContext(),
   *     queryInsights(),
   *   ],
   * })
   * ```
   */
  comments?: runtime.SqlCommenterPlugin[];
  /**
   * Optional maximum size for the query plan cache. If not provided, a default size will be used.
   * A value of `0` can be used to disable the cache entirely. A higher cache size can improve
   * performance for applications that execute a large number of unique queries, while a smaller
   * cache size can reduce memory usage.
   *
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter,
   *   queryPlanCacheMaxSize: 100,
   * })
   * ```
   */
  queryPlanCacheMaxSize?: number;
};
type GlobalOmitConfig = {
  user?: UserOmit;
  session?: SessionOmit;
  account?: AccountOmit;
  verification?: VerificationOmit;
  rateLimit?: RateLimitOmit;
};
type LogLevel = 'info' | 'query' | 'warn' | 'error';
type LogDefinition = {
  level: LogLevel;
  emit: 'stdout' | 'event';
};
type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
type QueryEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
};
type LogEvent = {
  timestamp: Date;
  message: string;
  target: string;
};
type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
/**
 * `PrismaClient` proxy available in interactive transactions.
 */
type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
//#endregion
//#region src/generated/prisma/internal/class.d.ts
type LogOptions<ClientOptions extends PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<LogLevel | LogDefinition> ? GetEvents<ClientOptions['log']> : never : never;
interface PrismaClientConstructor {
  /**
  * ## Prisma Client
  *
  * Type-safe database client for TypeScript
  * @example
  * ```
  * const prisma = new PrismaClient({
  *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
  * })
  * // Fetch zero or more Users
  * const users = await prisma.user.findMany()
  * ```
  *
  * Read more in our [docs](https://pris.ly/d/client).
  */
  new <Options extends PrismaClientOptions = PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends PrismaClientOptions['omit'] = (Options extends {
    omit: infer U;
  } ? U : PrismaClientOptions['omit']), ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options: Subset<Options, PrismaClientOptions>): PrismaClient$1<LogOpts, OmitOpts, ExtArgs>;
}
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
interface PrismaClient$1<in LogOpts extends LogLevel = never, in out OmitOpts extends PrismaClientOptions['omit'] = undefined, in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
  [K: symbol]: {
    types: TypeMap<ExtArgs>['other'];
  };
  $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? QueryEvent : LogEvent) => void): PrismaClient$1;
  /**
   * Connect with the database
   */
  $connect(): runtime.Types.Utils.JsPromise<void>;
  /**
   * Disconnect from the database
   */
  $disconnect(): runtime.Types.Utils.JsPromise<void>;
  /**
     * Executes a prepared raw query and returns the number of affected rows.
     * @example
     * ```
     * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Sql, ...values: any[]): PrismaPromise<number>;
  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): PrismaPromise<number>;
  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Sql, ...values: any[]): PrismaPromise<T>;
  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): PrismaPromise<T>;
  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends PrismaPromise<any>[]>(arg: [...P], options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: TransactionIsolationLevel;
  }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
  $transaction<R>(fn: (prisma: Omit<PrismaClient$1, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: TransactionIsolationLevel;
  }): runtime.Types.Utils.JsPromise<R>;
  $extends: runtime.Types.Extensions.ExtendsHook<"extends", TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<TypeMapCb<OmitOpts>, {
    extArgs: ExtArgs;
  }>>;
  /**
  * `prisma.user`: Exposes CRUD operations for the **User** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more Users
  * const users = await prisma.user.findMany()
  * ```
  */
  get user(): UserDelegate<ExtArgs, {
    omit: OmitOpts;
  }>;
  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): SessionDelegate<ExtArgs, {
    omit: OmitOpts;
  }>;
  /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): AccountDelegate<ExtArgs, {
    omit: OmitOpts;
  }>;
  /**
   * `prisma.verification`: Exposes CRUD operations for the **Verification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Verifications
    * const verifications = await prisma.verification.findMany()
    * ```
    */
  get verification(): VerificationDelegate<ExtArgs, {
    omit: OmitOpts;
  }>;
  /**
   * `prisma.rateLimit`: Exposes CRUD operations for the **RateLimit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RateLimits
    * const rateLimits = await prisma.rateLimit.findMany()
    * ```
    */
  get rateLimit(): RateLimitDelegate<ExtArgs, {
    omit: OmitOpts;
  }>;
}
//#endregion
//#region src/generated/prisma/client.d.ts
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
declare const PrismaClient: PrismaClientConstructor;
type PrismaClient<LogOpts extends LogLevel = never, OmitOpts extends PrismaClientOptions["omit"] = PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = PrismaClient$1<LogOpts, OmitOpts, ExtArgs>;
/**
 * Model User
 *
 */
type User = UserModel;
/**
 * Model Session
 *
 */
type Session = SessionModel;
/**
 * Model Account
 *
 */
type Account = AccountModel;
/**
 * Model Verification
 *
 */
type Verification = VerificationModel;
/**
 * Model RateLimit
 *
 */
type RateLimit = RateLimitModel;
//#endregion
//#region src/client.d.ts
declare const prisma: PrismaClient;
//#endregion
export { enums_d_exports as $Enums, Account, prismaNamespace_d_exports as Prisma, PrismaClient, RateLimit, Session, User, Verification, prisma };