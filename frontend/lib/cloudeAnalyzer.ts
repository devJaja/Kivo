export interface ArbitrageOpportunity {
  id: string;
  token: string;
  fromChainName: string;
  toChainName: string;
  amount: string;
  fromPrice: string;
  toPrice: string;
  profitPercent: number;
  bridgeFee: string;
  gasEstimate: string;
  netProfit: string;
  priceImpact: number;
  liquidityDepth: string;
}

export interface AnalysisResult {
  recommendation: 'execute' | 'monitor' | 'reject';
  reasoning: string;
  riskAssessment: string;
  confidence: number;
}

export class ClaudeAIAnalyzer {
  async analyzeOpportunity(opportunity: ArbitrageOpportunity): Promise<AnalysisResult> {
    try {
      const prompt = `Analyze this arbitrage opportunity:

Token: ${opportunity.token}
Route: ${opportunity.fromChainName} → ${opportunity.toChainName}
Amount: ${opportunity.amount}

Prices:
- Source Chain: $${opportunity.fromPrice}
- Destination Chain: $${opportunity.toPrice}
- Price Difference: ${opportunity.profitPercent}%

Costs:
- Bridge Fee: $${opportunity.bridgeFee}
- Gas Estimate: $${opportunity.gasEstimate}
- Net Profit: $${opportunity.netProfit}

Additional Metrics:
- Price Impact: ${opportunity.priceImpact}%
- Liquidity Depth: ${opportunity.liquidityDepth}

As an expert DeFi arbitrage analyst, provide:
1. Recommendation (execute/monitor/reject)
2. Risk assessment
3. Reasoning
4. Confidence level (0-100)

Respond ONLY in JSON format:
{
  "recommendation": "execute|monitor|reject",
  "reasoning": "detailed explanation",
  "riskAssessment": "low|medium|high with explanation",
  "confidence": 85
}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      const data = await response.json();
      const responseText = data.content[0].text;
      
      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return analysis;
      }

      // Fallback if Claude doesn't return proper JSON
      return {
        recommendation: 'monitor',
        reasoning: 'Unable to parse AI response',
        riskAssessment: 'medium',
        confidence: 50,
      };
    } catch (error) {
      console.error('Claude AI analysis failed:', error);
      return {
        recommendation: 'reject',
        reasoning: 'AI analysis unavailable',
        riskAssessment: 'Unable to assess',
        confidence: 0,
      };
    }
  }

  async getBatchAnalysis(opportunities: ArbitrageOpportunity[]): Promise<Map<string, AnalysisResult>> {
    const analyses = new Map();

    for (const opp of opportunities) {
      const analysis = await this.analyzeOpportunity(opp);
      analyses.set(opp.id, analysis);
      
      // Rate limiting for Claude API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return analyses;
  }
}