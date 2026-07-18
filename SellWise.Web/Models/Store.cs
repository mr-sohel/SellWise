using System;
using System.Collections.Generic;

namespace SellWise.Web.Models;

public class Store
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? NameBn { get; set; }
    public string Currency { get; set; } = "BDT";
    public string Timezone { get; set; } = "Asia/Dhaka";
    public string? BusinessType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<StoreMember> Members { get; set; } = new List<StoreMember>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Customer> Customers { get; set; } = new List<Customer>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
