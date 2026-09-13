export async function validateSchema(schema, data) {
  try {
    await schema.validate(data, {
      abortEarly: false,
    });

    return {
      isValid: true,
      errors: {},
    };
  } catch (err) {
    const formattedErrors = {};

    err.inner.forEach((error) => {
      if (!formattedErrors[error.path]) {
        formattedErrors[error.path] = error.message;
      }
    });

    return {
      isValid: false,
      errors: formattedErrors,
    };
  }
}
