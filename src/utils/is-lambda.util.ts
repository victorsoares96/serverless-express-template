function isLambda(): boolean {
  return !!process.env.LAMBDA_TASK_ROOT;
}

export default isLambda;
