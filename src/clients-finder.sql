/* @name getAllClients */
SELECT "id", "name", "enabled"
FROM client
  LEFT JOIN client_portal ON client_portal."clientId" = client.id;
