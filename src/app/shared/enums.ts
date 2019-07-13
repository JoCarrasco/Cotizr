export enum AuthType {
  Employee = 'admin',
  Customer = 'customer',
  Guest = 'app'
}

export const AuthTypeMetadata = {
  [AuthType.Employee]: { name: 'Trabajador OfficeNET' },
  [AuthType.Customer]: { name: 'Cliente OfficeNET' },
  [AuthType.Guest]: { name: 'Usuario CotizaYA' }
};

export enum CartOperation {
  Add = 0,
  Rest
}

export enum StorageKey {
  OfflineModeSettings = 'cotizr-offline-mode',
  Session = 'cotizr-storage-session',
  Quotation = 'cotizr-storage-quotaton',
  OfflineProducts = 'cotizr-storage-offline-products'
}

export enum APIResource {
  AuthToken = 'token',
  Quotations = 'quotations',
  Products = 'products',
  Authentication = 'auth',
  Images = 'images',
  Registration = 'register'
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

export enum ActionType {
  Error,
  Loading,
  Success,
  Message
}

export const ToastAction = {
  [ActionType.Error]: {
    'background-color': '#F44336',
    'color': '#fff'
  },
  [ActionType.Loading]: {
    'background-color': '#fff',
    'color': '#3F51B5'
  },
  [ActionType.Success]: {
    'background-color': '#4CAF50',
    'color': '#fff'
  },
  [ActionType.Message]: {
    'background-color': '#fff',
    'color': '#1b1b1b'
  }
};

export const ErrorMetadata = {
  [ErrorType.WrongAuth]: { message: 'La contraseña o el email es incorrecto' },
  [ErrorType.InvalidEmail]: { message: 'El email es invalido' },
  [ErrorType.NoPassword]: { message: 'Ingresa una contrasena por favor.' },
  [ErrorType.NoAddress]: { message: 'Ingresa tu direccion' },
  [ErrorType.MoreThanFourCharsName]: { message: 'Ingresa una nombre de mas de 4 caracteres.' },
  [ErrorType.ExistingEmail]: { message: 'Este email ya esta en uso' },
  [ErrorType.NonExistingEmail]: { message: 'Este email no esta registrado' }
};

export enum ResponseStatus {
  NotFound = 404,
  BadServerResponse = 1200,
  Unauthorized = 401,
  WrongAuth = 400
}

export const ResponseStatusInfo = {
  [ResponseStatus.NotFound]: {
    message: 'Lo siento, pero el servidor no puede encontrar el recurso que se ha intentado buscar'
  },
  [ResponseStatus.Unauthorized]: {
    message: 'No estas autorizado, para hacer esta accion. Lo sentimos'
  },
  [ResponseStatus.BadServerResponse]: {
    message: 'El servidor no retorna recursos correctamente'
  },
  [ResponseStatus.WrongAuth]: {
    message: 'Usuario incorrecto'
  }
};

export enum QuotationState {
  Pendent = 0,
  Delivered,
  Approved,
  Rejected
}

export const QuotationStateInfo = {
  [QuotationState.Pendent]: { message: 'Pendiente' },
  [QuotationState.Delivered]: { message: 'Pagada' },
  [QuotationState.Approved]: { message: 'Aprobada' },
  [QuotationState.Rejected]: { message: 'Rechazada' }
};

