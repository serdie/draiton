// Defines a custom error class for Firestore permission errors.

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: The following request was denied by Firestore Security Rules:
${JSON.stringify({
  path: context.path,
  operation: context.operation,
  requestResourceData: context.requestResourceData,
}, null, 2)}`;

    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }
}
