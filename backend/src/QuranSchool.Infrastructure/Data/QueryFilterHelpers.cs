using System.Linq.Expressions;

namespace Microsoft.EntityFrameworkCore.Query;

public static class QueryFilterHelpers
{
    public static LambdaExpression CreateSoftDeleteFilter(Type entityType)
    {
        var parameter = Expression.Parameter(entityType, "e");
        var property = Expression.Property(parameter, "IsDeleted");
        var condition = Expression.Equal(property, Expression.Constant(false));
        return Expression.Lambda(condition, parameter);
    }
}
