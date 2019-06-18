export enum AuthType {
  Employee = 'Employee',
  Customer = 'Customer',
  Guest = 'Guest'
}

export enum CartOperation {
  Add = 0,
  Rest
}

export enum StorageKey {
  Session = 'cotizr-storage-session',
  Quotation = 'cotizr-storage-quotaton',
  OfflineProducts = 'cotizr-storage-offline-products'
}

export enum APIResource {
  AuthToken = 'cotizr_token',
  CotizrUser = 'cotizr_user',
  Quotations = 'cotizr_quotations',
  Customers = 'customers',
  Employees = 'employees',
  Products = 'products',
  Search = 'search',
  SearchProducts = 'search/products'
}

export enum APIFormat {
  SchemaBlank = 'schema=blank',
  DisplayFullJSON = '&output_format=JSON&display=full'
}

export enum ErrorType {
  WrongAuth = 0,
  InvalidEmail,
  NoPassword,
  MoreThanFourCharsName,
  NoAddress,
  ExistingEmail,
  NonExistingEmail
}

export enum CRUDAction {
  Create = 'post',
  Retrieve = 'get',
  Update = 'put',
  Delete = 'delete',
}

export const ErrorMetadata = {
  [ErrorType.WrongAuth]: { message: 'La contraseña o el email es incorrecto' },
  [ErrorType.InvalidEmail]: { message: 'El email es invalido' },
  [ErrorType.NoPassword]: { message: 'Ingresa una contrasena por favor.' },
  [ErrorType.NoAddress]: { message: 'Ingresa tu direccion' },
  [ErrorType.MoreThanFourCharsName]: { message: 'Ingresa una nombre de mas de 4 caracteres.' },
  [ErrorType.ExistingEmail]: { message: 'Este email ya esta en uso' },
  [ErrorType.NonExistingEmail]: { message: 'Este email no esta registrado' }
};

export const ResourceByAuthType = {
  [AuthType.Employee]: {
    resource: APIResource.Employees,
    get: 'getEmployee'
  },
  [AuthType.Customer]: {
    resource: APIResource.Customers,
    get: 'getCustomers'
  },
  [AuthType.Guest]: {
    resource: APIResource.CotizrUser,
    get: 'getCotizrUsers'
  }
};

export enum QuotationState {
  Pendent = 0,
  Readed,
  Complete
}
