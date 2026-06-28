#![deny(clippy::all)]
use std::sync::OnceLock;

use hf_hub::api::sync::Api;

use napi_derive::napi;

use gliner::model::{input::text::TextInput, params::Parameters, pipeline::span::SpanMode, GLiNER};

use orp::params::RuntimeParameters;

static MODEL: OnceLock<GLiNER<SpanMode>> = OnceLock::new();

const REPO: &str = "knowledgator/gliner-x-large";

fn load_model() -> GLiNER<SpanMode> {
  println!("loading model...");

  let api = Api::new().expect("failed hf api");

  let repo = api.model(REPO.to_string());

  let tokenizer = repo
    .get("tokenizer.json")
    .expect("tokenizer download failed");

  let model = repo
    .get("onnx/model_quantized.onnx")
    .expect("model download failed");

  GLiNER::<SpanMode>::new(
    Parameters {
      threshold: 0.5,
      ..Default::default()
    },
    RuntimeParameters::default(),
    tokenizer,
    model,
  )
  .expect("failed loading gliner")
}

fn get_model() -> &'static GLiNER<SpanMode> {
  MODEL.get_or_init(load_model)
}

#[napi(object)]
pub struct Entity {
  pub text: String,
  pub label: String,
  pub score: f64,
}

#[napi]
pub fn extract_entities(text: String, labels: Vec<String>) -> Vec<Entity> {
  let model = get_model();

  let label_refs = labels.iter().map(String::as_str).collect::<Vec<_>>();

  let input = TextInput::from_str(&[text.as_str()], &label_refs).expect("invalid input");

  let output = model.inference(input).expect("inference failed");

  let spans = output.spans.first().expect("empty output");

  spans
    .iter()
    .map(|span| Entity {
      text: span.text().to_string(),

      label: span.class().to_string(),

      score: span.probability() as f64,
    })
    .collect()
}
