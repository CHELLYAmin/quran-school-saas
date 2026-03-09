using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuranSchool.Application.Interfaces;
using Stripe;
using Stripe.Checkout;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/payment")]
public class StripeController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<StripeController> _logger;

    public StripeController(IPaymentService paymentService, IConfiguration configuration, ILogger<StripeController> logger)
    {
        _paymentService = paymentService;
        _configuration = configuration;
        _logger = logger;
    }

    [Authorize]
    [HttpPost("{id}/checkout")]
    public async Task<IActionResult> CreateCheckoutSession(Guid id, [FromBody] CheckoutRequest request)
    {
        try
        {
            var sessionUrl = await _paymentService.CreateCheckoutSessionAsync(id, request.SuccessUrl, request.CancelUrl);
            return Ok(new { url = sessionUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout session");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _configuration["Stripe:WebhookSecret"]
            );

            if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Session;
                if (session != null && session.Metadata.TryGetValue("paymentId", out var paymentIdStr))
                {
                    if (Guid.TryParse(paymentIdStr, out var paymentId))
                    {
                        await _paymentService.UpdateStatusAsync(paymentId, new QuranSchool.Application.DTOs.Payment.UpdatePaymentStatusRequest(
                            QuranSchool.Domain.Enums.PaymentStatus.Paid,
                            DateTime.UtcNow,
                            session.PaymentIntentId
                        ));
                        _logger.LogInformation($"Payment {paymentId} marked as Paid via Webhook.");
                    }
                }
            }

            return Ok();
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe Webhook Error");
            return BadRequest();
        }
    }
}

public class CheckoutRequest
{
    public string SuccessUrl { get; set; } = string.Empty;
    public string CancelUrl { get; set; } = string.Empty;
}
