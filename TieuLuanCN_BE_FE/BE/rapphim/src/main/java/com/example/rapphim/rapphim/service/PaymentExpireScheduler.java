package com.example.rapphim.rapphim.service;

import com.example.rapphim.rapphim.entity.Payment;
import com.example.rapphim.rapphim.entity.Seat;
import com.example.rapphim.rapphim.entity.Ticket;
import com.example.rapphim.rapphim.repository.PaymentRepository;
import com.example.rapphim.rapphim.repository.TicketRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class PaymentExpireScheduler {

    // Payment PENDING qua so phut nay se bi coi la het han (FE dem nguoc 60s)
    private static final int EXPIRE_MINUTES = 2;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    // Chay moi 1 phut: huy ve cua cac payment PENDING qua han (user dong tab, khong bam xac nhan/huy)
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void expirePendingPayments() {
        try {
            LocalDateTime deadline = LocalDateTime.now().minusMinutes(EXPIRE_MINUTES);
            List<Payment> expiredPayments = paymentRepository.findByStatusAndCreatedAtBefore(Payment.Status.PENDING, deadline);

            if (expiredPayments.isEmpty()) {
                return;
            }

            for (Payment payment : expiredPayments) {
                payment.setStatus(Payment.Status.EXPIRED);
                payment.setResultCode(1);
                payment.setMessage("Payment expired - auto cancelled");

                // Huy ve va tra ghe
                for (Ticket ticket : payment.getTickets()) {
                    if (ticket.getStatus() == Ticket.Status.PENDING) {
                        ticket.setStatus(Ticket.Status.CANCELLED);
                        ticket.getSeat().setStatus(Seat.Status.AVAILABLE);
                        ticketRepository.save(ticket);
                    }
                }

                paymentRepository.save(payment);
                log.info("[PAYMENT EXPIRE] Da huy payment {} ({} ve)", payment.getOrderId(), payment.getTickets().size());
            }

            log.info("[PAYMENT EXPIRE] Hoan thanh! Da huy {} payment qua han", expiredPayments.size());

        } catch (Exception e) {
            log.error("[PAYMENT EXPIRE] Loi khi huy payment qua han: {}", e.getMessage(), e);
        }
    }
}
