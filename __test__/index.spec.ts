import test from "ava"
import { extractEntities } from "../index"

test("deve extrair entidades corretamente com seus respectivos labels e scores", (t) => {
  const text = `
    Elon Musk founded SpaceX in 2002 in Hawthorne, California. The company
    developed the Falcon 9 rocket and the Dragon spacecraft. SpaceX was awarded
    a $1.6 billion NASA contract for cargo resupply missions to the International
    Space Station.
  `;

  const labels = [
    "person",
    "organization",
    "date",
    "location",
    "product",
    "monetary value",
  ];

  const result = extractEntities(text, labels);

  // 1. Valida o total de entidades encontradas
  t.is(result.length, 9);

  // 2. Valida a estrutura exata esperada (mapeando para ignorar a flutuação do score bruto)
  const expectedEntities = [
    { text: "Elon Musk", label: "person" },
    { text: "SpaceX", label: "organization" },
    { text: "2002", label: "date" },
    { text: "Hawthorne, California", label: "location" },
    { text: "Falcon 9", label: "product" },
    { text: "Dragon", label: "product" },
    { text: "SpaceX", label: "organization" },
    { text: "$1.6 billion", label: "monetary value" },
    { text: "International\nSpace Station", label: "location" },
  ];

expectedEntities.forEach((expected, index) => {
  const current = result[index];

  // Remove quebras de linha e espaços duplos para comparar apenas o conteúdo textual
  const normalizedActual = current.text.replace(/\s+/g, ' ').trim();
  const normalizedExpected = expected.text.replace(/\s+/g, ' ').trim();

  t.is(normalizedActual, normalizedExpected, `Erro no índice [${index}] - text`);
  t.is(current.label, expected.label, `Erro no índice [${index}] - label`);
  t.is(typeof current.score, "number", `Erro no índice [${index}] - score deve ser um número`);
  t.true(current.score > 0 && current.score <= 1, `Erro no índice [${index}] - score fora do range [0, 1]`);
});
});