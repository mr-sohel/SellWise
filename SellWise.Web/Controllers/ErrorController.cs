using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SellWise.Web.Models;

namespace SellWise.Web.Controllers;

/// <summary>Friendly error page used in production instead of the developer exception page.</summary>
[AllowAnonymous]
public class ErrorController : Controller
{
    [Route("/error")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Index() =>
        View("~/Views/Shared/Error.cshtml", new ErrorViewModel
        {
            RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
        });
}
