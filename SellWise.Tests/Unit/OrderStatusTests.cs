using SellWise.Web.Models;

namespace SellWise.Tests.Unit;

public class OrderStatusTests
{
    [Theory]
    [InlineData("pending", "processing", true)]
    [InlineData("pending", "cancelled", true)]
    [InlineData("processing", "delivered", true)]
    [InlineData("delivered", "returned", true)]
    [InlineData("completed", "returned", true)]
    [InlineData("cancelled", "pending", true)]
    [InlineData("completed", "pending", false)]
    [InlineData("completed", "cancelled", false)]
    [InlineData("returned", "completed", false)]
    [InlineData("pending", "returned", false)]
    [InlineData("pending", "unknown", false)]
    public void CanChange_FollowsTheStateMachine(string from, string to, bool allowed)
    {
        Assert.Equal(allowed, OrderStatus.CanChange(from, to));
    }

    [Fact]
    public void ReturnedIsFinal()
    {
        Assert.Empty(OrderStatus.NextStatuses(OrderStatus.Returned));
    }
}
