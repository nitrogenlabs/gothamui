import {authSignInSchema,authSignUpSchema} from './authSchemas.js';


test('keeps signin email/password requirements',() => {
  expect(authSignInSchema.safeParse({email:'a@example.com',password:'a',rememberEmail:false}).success).toBe(true);

  expect(authSignInSchema.safeParse({email:'bad',password:'',rememberEmail:true}).success).toBe(false);
});


test('keeps signup matching password, terms and eight-character minimum',() => {
  expect(authSignUpSchema.safeParse({acceptTerms:true,confirmPassword:'12345678',email:'a@example.com',password:'12345678'}).success).toBe(true);


  for(const change of [{acceptTerms:false},{confirmPassword:'secret',password:'secret'},{confirmPassword:'different'},{email:'bad'},{confirmPassword:''}]) {
    expect(authSignUpSchema.safeParse({acceptTerms:true,confirmPassword:'12345678',email:'a@example.com',password:'12345678',...change}).success).toBe(false);
  }
});

