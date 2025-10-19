(define-map tasks
  ((id uint))
  ((description (string-utf8 256)) (owner principal) (completed bool)))

(define-data-var task-counter uint u0)

(define-public (create-task (description (string-utf8 256)))
  (let ((id (+ u1 (var-get task-counter))))
    (map-set tasks ((id id)) ((description description) (owner tx-sender) (completed false)))
    (var-set task-counter id)
    (ok id)))

(define-public (complete-task (id uint))
  (begin
    (asserts! (is-eq (get owner (map-get? tasks ((id id)))) tx-sender) (err u401))
    (map-set tasks ((id id)) ((description (get description (map-get tasks ((id id)))))(owner tx-sender)(completed true)))
    (ok true)))

(define-read-only (get-task (id uint))
  (map-get? tasks ((id id))))

(define-read-only (get-task-counter)
  (var-get task-counter))
